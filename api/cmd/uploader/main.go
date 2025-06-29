package main

import (
	"context"
	"flag"
	"os"
	"strings"

	"chords.com/api/internal/entity"
	"chords.com/api/internal/logger"
	"chords.com/api/internal/orm"
	"chords.com/api/internal/service"
)

var files = flag.String("f", "", "Comma-separated list of chordpro files to upload")

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

	chordproService := service.NewChordProService()
	libraryService := service.NewPublicLibraryService()

	ctx := context.Background()
	ctx = orm.SetDB(ctx, orm.GetDBInstance())

	fileList := strings.Split(*files, ",")

	// If file list is 1 element, check if it is directory
	if len(fileList) == 1 {
		oneFile := strings.TrimSpace(fileList[0])
		fileInfo, err := os.Stat(oneFile)
		if err != nil {
			log.Error("Failed to get file info: ", oneFile, " Error: ", err)
			return
		}
		if fileInfo.IsDir() {
			log.Info("Input is a directory: ", oneFile)
			// If it is a directory, read all files in the directory
			dirFiles, err := os.ReadDir(oneFile)
			if err != nil {
				log.Error("Failed to read directory: ", oneFile, " Error: ", err)
				return
			}
			fileList = make([]string, 0, len(dirFiles))
			for _, dirFile := range dirFiles {
				if !dirFile.IsDir() {
					fileList = append(fileList, oneFile+string(os.PathSeparator)+dirFile.Name())
				}
			}
			if len(fileList) == 0 {
				log.Error("No files found in directory: ", fileList[0])
				return
			}
		}
	}

	log.Info("Files to upload: ", fileList)

	library, err := libraryService.EnsurePublicLibrary(ctx, "Public Library")
	if err != nil {
		log.Error("Failed to ensure public library: ", err)
		return
	}

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
		songInfo, err := chordproService.ParseChordPro(fileContent)
		if err != nil {
			log.Error("Failed to parse chordpro file: ", file, " Error: ", err)
			continue
		}

		// Save the song to the public library
		if err := libraryService.UploadSong(ctx, library, &entity.Song{
			Title:  songInfo.Title,
			Artist: songInfo.Artist,
			Format: entity.SheetFormat_Chordpro,
			Sheet:  fileContent,
		}); err != nil {
			log.Error("Failed to upload file: ", file, " Error: ", err)
			continue
		}
		log.Info("Successfully uploaded file: ", file)
	}
}
