package service

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"

	db "api-golang/internal/db/sqlc"
	"api-golang/internal/repository"

	"github.com/google/uuid"
)

const (
	MaxBlockContentBytes = 512 << 10 // 512 KiB per block
	MaxIconURLBytes      = 256 << 10 // 256 KiB for icon data URLs in dev
)

var (
	ErrContentTooLarge = errors.New("content too large")
	ErrInvalidIconURL  = errors.New("invalid icon url")
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
	repo         SpaceRepository
	allowDataURL bool
}

func NewSpaceService(repo SpaceRepository, production bool) *SpaceService {
	return &SpaceService{
		repo:         repo,
		allowDataURL: !production,
	}
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
		blocks = []db.Block{}
	}

	return space, blocks, nil
}

func (s *SpaceService) ListSpaces(ctx context.Context, userID uuid.UUID) ([]db.Space, error) {
	spaces, err := s.repo.ListSpaces(ctx, userID)
	if err != nil {
		return nil, err
	}
	if spaces == nil {
		return []db.Space{}, nil
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

	if err := validateIconURL(iconUrl, s.allowDataURL); err != nil {
		return err
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
		if len(b.Content) > MaxBlockContentBytes {
			return ErrContentTooLarge
		}
		if b.Type == "image" && strings.HasPrefix(b.Content, "data:") && !s.allowDataURL {
			return ErrInvalidIconURL
		}
		if b.X < 0 || b.Y < 0 || b.W <= 0 || b.H <= 0 {
			return fmt.Errorf("invalid block dimensions for block %s", b.ID)
		}
		b.SpaceID = spaceID
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

func validateIconURL(iconURL string, allowDataURL bool) error {
	if iconURL == "" {
		return nil
	}
	if strings.HasPrefix(iconURL, "data:") {
		if !allowDataURL {
			return ErrInvalidIconURL
		}
		if len(iconURL) > MaxIconURLBytes {
			return ErrContentTooLarge
		}
		return nil
	}
	if !strings.HasPrefix(iconURL, "https://") {
		return ErrInvalidIconURL
	}
	if len(iconURL) > 2048 {
		return ErrInvalidIconURL
	}
	return nil
}

func generateSlug(name string) string {
	slug := strings.ToLower(strings.TrimSpace(name))
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = nonAlnumRegex.ReplaceAllString(slug, "")
	slug = multiDashRegex.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")

	if slug == "" {
		slug = "space"
	}

	return fmt.Sprintf("%s-%s", slug, uuid.New().String()[:8])
}
