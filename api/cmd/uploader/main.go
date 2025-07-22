package main

import (
	"context"
	"flag"
	"os"
	"path/filepath"
	"strings"

	"chords.com/api/internal/chordpro"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/logger"
	"chords.com/api/internal/orm"
	"chords.com/api/internal/service"
)

var files = flag.String("f", "", "Comma-separated list of chordpro files to upload")
var lib = flag.String("lib", "Public Library", "Name of the public library to upload to")
var dryRun = flag.Bool("dry-run", false, "If true, only prints the files to be uploaded without actually uploading them")

// Command line tool to upload chordpro songs to the public library
// Usage: uploader <file1> <file2> ...
func main() {
	flag.Parse()
	if *files == "" {
		flag.Usage()
		return
	}

	log := logger.New()
	orm.InitSQLite()

	artistService := service.NewArtistService()
	songService := service.NewSongService()
	libraryService := service.NewLibraryService()
	chordproParser := chordpro.NewParser()

	ctx := context.Background()
	ctx = orm.WithDB(ctx, orm.GetDBInstance())

	fileList := strings.Split(*files, ",")

	// If file list is 1 element, check if it is directory
	if len(fileList) == 1 {
		root := strings.TrimSpace(fileList[0])
		fileList = []string{}
		filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
			if err != nil {
				log.Error("Failed to walk path: ", path, " Error: ", err)
				return err
			}
			if !info.IsDir() {
				fileList = append(fileList, path)
			}
			return nil
		})
	}

	// Filter out files that do not have .pro extension
	tmp := make([]string, 0, len(fileList))
	for _, file := range fileList {
		if strings.HasSuffix(strings.ToLower(file), ".pro") {
			tmp = append(tmp, file)
		}
	}
	fileList = tmp

	log.Info("Library name: ", *lib)
	log.Info("Dry run mode: ", *dryRun)
	log.Info("Files to upload: ", fileList)

	library, err := libraryService.EnsurePublicLibrary(ctx, *lib)
	if err != nil {
		log.Error("Failed to ensure public library: ", err)
		return
	}

	oks := 0
	errs := []string{}

	for _, file := range fileList {
		file = strings.TrimSpace(file)
		if file == "" {
			continue
		}

		log.Info("Uploading file: ", file)

		// Read the file content
		bytes, err := os.ReadFile(file)
		if err != nil {
			log.Error("Failed to read file: ", file, " Error: ", err)
			continue
		}
		fileContent := string(bytes)

		// Parse the chordpro file
		songInfo, err := chordproParser.Parse(fileContent)
		if err != nil {
			log.Error("Failed to parse chordpro file: ", file, " Error: ", err)
			continue
		}
		if songInfo.Title == "" || (songInfo.Artist == "" && songInfo.Composer == "") {
			head := strings.Split(fileContent, "\n")
			if len(head) > 10 {
				head = head[:10]
			}
			log.Error("Invalid chordpro file: ", file, " - missing title or artist and composer")
			log.Error("File content head: ", strings.Join(head, "\n"))
			continue
		}

		if *dryRun {
			log.Infow("Dry run - would upload song", "Title", songInfo.Title, "Artist", songInfo.Artist, "Composer", songInfo.Composer)
			continue
		}

		// Create or find artists and composers
		var artists []*entity.Artist
		if songInfo.Artist != "" {
			artist := &entity.Artist{Name: songInfo.Artist}
			err := artistService.CreateIfNotExists(ctx, artist)
			if err != nil {
				log.Error("Failed to create or find artist: ", songInfo.Artist, " Error: ", err)
				errs = append(errs, file)
				continue
			}
			artists = append(artists, artist)
		}
		var composers []*entity.Artist
		if songInfo.Composer != "" {
			composer := &entity.Artist{Name: songInfo.Composer}
			err := artistService.CreateIfNotExists(ctx, composer)
			if err != nil {
				log.Error("Failed to create or find composer: ", songInfo.Composer, " Error: ", err)
				errs = append(errs, file)
				continue
			}
			composers = append(composers, composer)
		}

		// Save the song to the public library
		song := &entity.Song{
			Title:     songInfo.Title,
			Artists:   artists,
			Composers: composers,
			Format:    entity.SheetFormat_Chordpro,
			Sheet:     fileContent,
		}
		if err = songService.CreateIfNotExists(ctx, song); err != nil {
			log.Error("Failed to create or find song: ", song.Title, " Error: ", err)
			errs = append(errs, file)
			continue
		}
		if err := libraryService.AddSongToLibrary(ctx, library, song); err != nil {
			log.Error("Failed to upload file: ", file, " Error: ", err)
			errs = append(errs, file)
			continue
		}
		oks++
		log.Info("Successfully uploaded file: ", file)
	}

	log.Infow("Upload completed", "Total files", len(fileList))
	if len(errs) > 0 {
		log.Error("Failed to upload the following files:")
		for _, errFile := range errs {
			log.Error(errFile)
		}
	} else {
		log.Info("All files uploaded successfully")
	}
	if oks == 0 {
		log.Error("No files were successfully uploaded")
	} else {
		log.Info("Successfully uploaded ", oks, " files")
	}
}
