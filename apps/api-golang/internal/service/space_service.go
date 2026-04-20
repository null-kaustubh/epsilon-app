package service

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	db "api-golang/internal/db/sqlc"
	"api-golang/internal/repository"

	"github.com/google/uuid"
)

type SpaceRepository interface {
	CreateSpace(ctx context.Context, arg db.CreateSpaceParams) (db.Space, error)
	GetSpaceBySlug(ctx context.Context, arg db.GetSpaceBySlugParams) (db.Space, error)
	ListSpaces(ctx context.Context, userID uuid.UUID) ([]db.Space, error)
	UpdateSpaceName(ctx context.Context, arg db.UpdateSpaceNameParams) error
	DeleteSpace(ctx context.Context, arg db.DeleteSpaceParams) error
	GetBlocksBySpaceID(ctx context.Context, spaceID uuid.UUID) ([]db.Block, error)
	UpsertBlock(ctx context.Context, arg db.UpsertBlockParams) error
	DeleteBlock(ctx context.Context, arg db.DeleteBlockParams) error
}

type SpaceService struct {
	repo SpaceRepository
}

func NewSpaceService(repo SpaceRepository) *SpaceService {
	return &SpaceService{repo: repo}
}

var validBlockTypes = map[string]bool{
	"note": true, "markdown": true, "image": true,
	"code": true, "todo": true,
}

var (
	nonAlnumRegex  = regexp.MustCompile(`[^a-z0-9-]`)
	multiDashRegex = regexp.MustCompile(`-+`)
)

func (s *SpaceService) CreateSpace(ctx context.Context, userID uuid.UUID, name, description string) (db.Space, error) {
	name = strings.TrimSpace(name)

	if name == "" {
		name = "Untitled"
	}

	slug := generateSlug(name)

	return s.repo.CreateSpace(ctx, db.CreateSpaceParams{
		ID:          uuid.New(),
		UserID:      userID,
		Name:        name,
		Slug:        slug,
		Description: strings.TrimSpace(description),
		IconUrl:     "",
	})
}

func (s *SpaceService) GetSpace(ctx context.Context, slug string, userID uuid.UUID) (db.Space, []db.Block, error) {
	space, err := s.repo.GetSpaceBySlug(ctx, db.GetSpaceBySlugParams{
		Slug:   slug,
		UserID: userID,
	})
	if err != nil {
		return db.Space{}, nil, err
	}

	blocks, err := s.repo.GetBlocksBySpaceID(ctx, space.ID)
	if err != nil {
		return db.Space{}, nil, err
	}

	if blocks == nil {
		blocks = []db.Block{} // always return [] never null
	}

	return space, blocks, nil
}

func (s *SpaceService) ListSpaces(ctx context.Context, userID uuid.UUID) ([]db.Space, error) {
	spaces, err := s.repo.ListSpaces(ctx, userID)
	if err != nil {
		return nil, err
	}
	if spaces == nil {
		return []db.Space{}, nil // always return empty slice, never null
	}
	return spaces, nil
}

func (s *SpaceService) UpdateSpaceName(ctx context.Context, slug string, userID uuid.UUID, name, description, iconUrl string) error {
	name = strings.TrimSpace(name)

	if name == "" {
		return repository.ErrInvalidSpaceName
	}

	if len(name) > 100 {
		return repository.ErrSpaceNameTooLong
	}

	return s.repo.UpdateSpaceName(ctx, db.UpdateSpaceNameParams{
		Name:        name,
		Description: strings.TrimSpace(description),
		IconUrl:     iconUrl,
		Slug:        slug,
		UserID:      userID,
	})
}

func (s *SpaceService) DeleteSpace(ctx context.Context, slug string, userID uuid.UUID) error {
	return s.repo.DeleteSpace(ctx, db.DeleteSpaceParams{
		Slug:   slug,
		UserID: userID,
	})
}

func (s *SpaceService) SaveBlocks(ctx context.Context, spaceID uuid.UUID, blocks []db.UpsertBlockParams) error {
	for _, b := range blocks {
		if !validBlockTypes[b.Type] {
			return repository.ErrInvalidBlockType
		}
		if b.X < 0 || b.Y < 0 || b.W <= 0 || b.H <= 0 {
			return fmt.Errorf("invalid block dimensions for block %s", b.ID)
		}
		b.SpaceID = spaceID // always enforce server-side, never trust client
		if err := s.repo.UpsertBlock(ctx, b); err != nil {
			return err
		}
	}
	return nil
}

func (s *SpaceService) DeleteBlock(ctx context.Context, blockID uuid.UUID, spaceID uuid.UUID) error {
	return s.repo.DeleteBlock(ctx, db.DeleteBlockParams{
		ID:      blockID,
		SpaceID: spaceID,
	})
}

func generateSlug(name string) string {
	slug := strings.ToLower(strings.TrimSpace(name))
	slug = strings.ReplaceAll(slug, " ", "-")
	// strip any characters that aren't alphanumeric or hyphens
	slug = nonAlnumRegex.ReplaceAllString(slug, "")
	// collapse multiple hyphens into one
	slug = multiDashRegex.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")

	if slug == "" {
		slug = "space"
	}

	return fmt.Sprintf("%s-%s", slug, uuid.New().String()[:8])
}
