package usecase

import (
	"context"
	"testing"

	"chords.com/api/internal/auth"
	"chords.com/api/internal/config"
	"chords.com/api/internal/dto"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"
)

func initForTest() *gorm.DB {
	config.InitForTest()
	db, _ := orm.InitForTest()
	return db
}

// MockArtistService for testing
type MockArtistService struct {
	mock.Mock
}

func (m *MockArtistService) CreateIfNotExists(ctx context.Context, name string) (*entity.Artist, error) {
	args := m.Called(ctx, name)
	return args.Get(0).(*entity.Artist), args.Error(1)
}

// MockLibraryService for testing
type MockLibraryService struct {
	mock.Mock
}

func (m *MockLibraryService) EnsureUserLibrary(ctx context.Context, userID uint) (*entity.Library, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).(*entity.Library), args.Error(1)
}

func (m *MockLibraryService) AddArtistToLibrary(ctx context.Context, library *entity.Library, artist *entity.Artist) error {
	args := m.Called(ctx, library, artist)
	return args.Error(0)
}

func (m *MockLibraryService) AddSongToLibrary(ctx context.Context, library *entity.Library, song *entity.Song) error {
	args := m.Called(ctx, library, song)
	return args.Error(0)
}

func TestCreateSongUseCase_Execute(t *testing.T) {
	tx := initForTest()
	var err error

	// Create test user
	user := entity.User{}
	err = tx.Create(&user).Error
	assert.NoError(t, err, "failed to create test user")

	// Create test library
	library := entity.Library{OwnerID: user.ID, Name: "Test Library", Type: "private"}
	err = tx.Create(&library).Error
	assert.NoError(t, err, "failed to create test library")

	ctx := context.Background()
	ctx = auth.WithAccessToken(ctx, &auth.AccessToken{UserID: user.ID})
	ctx = orm.WithDB(ctx, tx)

	t.Run("successful song creation with artists", func(t *testing.T) {
		mockArtistService := new(MockArtistService)
		mockLibraryService := new(MockLibraryService)

		artist1 := &entity.Artist{BaseEntity: entity.BaseEntity{ID: 1}, Name: "Artist 1"}
		artist2 := &entity.Artist{BaseEntity: entity.BaseEntity{ID: 2}, Name: "Artist 2"}

		mockArtistService.On("CreateIfNotExists", ctx, "Artist 1").Return(artist1, nil)
		mockArtistService.On("CreateIfNotExists", ctx, "Artist 2").Return(artist2, nil)
		mockLibraryService.On("EnsureUserLibrary", ctx, user.ID).Return(&library, nil)
		mockLibraryService.On("AddArtistToLibrary", ctx, &library, mock.AnythingOfType("*entity.Artist")).Return(nil)
		mockLibraryService.On("AddSongToLibrary", ctx, &library, mock.AnythingOfType("*entity.Song")).Return(nil)

		uc := &CreateSongUseCase{
			artistService:  mockArtistService,
			libraryService: mockLibraryService,
		}

		req := &dto.CreateSongRequest{
			Title:   "Test Song",
			Artists: []string{"Artist 1", "Artist 2"},
			Format:  "chordpro",
			Sheet:   "{title: Test Song}\n[C]Hello world",
		}

		song, err := uc.Execute(ctx, req)

		assert.NoError(t, err)
		assert.NotNil(t, song)
		assert.Equal(t, "Test Song", song.Title)
		assert.Equal(t, "chordpro", string(song.Format))
		assert.Equal(t, user.ID, song.OwnerID)
		assert.Len(t, song.Artists, 2)

		mockArtistService.AssertExpectations(t)
		mockLibraryService.AssertExpectations(t)
	})

	t.Run("successful song creation with composers", func(t *testing.T) {
		mockArtistService := new(MockArtistService)
		mockLibraryService := new(MockLibraryService)

		composer1 := &entity.Artist{BaseEntity: entity.BaseEntity{ID: 3}, Name: "Composer 1"}

		mockArtistService.On("CreateIfNotExists", ctx, "Composer 1").Return(composer1, nil)
		mockLibraryService.On("EnsureUserLibrary", ctx, user.ID).Return(&library, nil)
		mockLibraryService.On("AddArtistToLibrary", ctx, &library, mock.AnythingOfType("*entity.Artist")).Return(nil)
		mockLibraryService.On("AddSongToLibrary", ctx, &library, mock.AnythingOfType("*entity.Song")).Return(nil)

		uc := &CreateSongUseCase{
			artistService:  mockArtistService,
			libraryService: mockLibraryService,
		}

		req := &dto.CreateSongRequest{
			Title:     "Test Song",
			Composers: []string{"Composer 1"},
			Format:    "chordpro",
			Sheet:     "{title: Test Song}\n[C]Hello world",
		}

		song, err := uc.Execute(ctx, req)

		assert.NoError(t, err)
		assert.NotNil(t, song)
		assert.Equal(t, "Test Song", song.Title)
		assert.Len(t, song.Composers, 1)

		mockArtistService.AssertExpectations(t)
		mockLibraryService.AssertExpectations(t)
	})
}

func TestNewCreateSongUseCase(t *testing.T) {
	t.Run("NewCreateSongUseCase returns instance", func(t *testing.T) {
		uc := NewCreateSongUseCase()

		assert.NotNil(t, uc, "expected NewCreateSongUseCase to return an instance")
		assert.IsType(t, &CreateSongUseCase{}, uc, "expected NewCreateSongUseCase to return *CreateSongUseCase")
	})
}
