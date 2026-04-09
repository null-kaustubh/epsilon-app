package repository

import (
	"context"
	"database/sql"
	"errors"

	db "api-golang/internal/db/sqlc"

	"github.com/google/uuid"
)

type PostgresSpaceRepository struct {
	queries *db.Queries
}

func NewPostgresSpaceRepository(conn *sql.DB) *PostgresSpaceRepository {
	return &PostgresSpaceRepository{
		queries: db.New(conn),
	}
}

func (r *PostgresSpaceRepository) CreateSpace(ctx context.Context, arg db.CreateSpaceParams) (db.Space, error) {
	return r.queries.CreateSpace(ctx, arg)
}

func (r *PostgresSpaceRepository) GetSpaceBySlug(ctx context.Context, arg db.GetSpaceBySlugParams) (db.Space, error) {
	space, err := r.queries.GetSpaceBySlug(ctx, arg)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return db.Space{}, ErrSpaceNotFound
		}
		return db.Space{}, err
	}

	return space, nil
}

func (r *PostgresSpaceRepository) ListSpaces(ctx context.Context, userID uuid.UUID) ([]db.Space, error) {
	return r.queries.ListSpaces(ctx, userID)
}

func (r *PostgresSpaceRepository) UpdateSpaceName(ctx context.Context, arg db.UpdateSpaceNameParams) error {
	rows, err := r.queries.UpdateSpaceName(ctx, arg)
	if err != nil {
		return err
	}

	if rows == 0 {
		return ErrSpaceNotFound
	}

	return nil
}

func (r *PostgresSpaceRepository) DeleteSpace(ctx context.Context, arg db.DeleteSpaceParams) error {
	rows, err := r.queries.DeleteSpace(ctx, arg)
	if err != nil {
		return err
	}

	if rows == 0 {
		return ErrSpaceNotFound
	}

	return nil
}

func (r *PostgresSpaceRepository) GetBlocksBySpaceID(ctx context.Context, spaceID uuid.UUID) ([]db.Block, error) {
	return r.queries.GetBlocksBySpaceID(ctx, spaceID)
}

func (r *PostgresSpaceRepository) UpsertBlock(ctx context.Context, arg db.UpsertBlockParams) error {
	return r.queries.UpsertBlock(ctx, arg)
}

func (r *PostgresSpaceRepository) DeleteBlock(ctx context.Context, arg db.DeleteBlockParams) error {
	rows, err := r.queries.DeleteBlock(ctx, arg)
	if err != nil {
		return err
	}

	if rows == 0 {
		return ErrBlockNotFound
	}

	return nil
}
