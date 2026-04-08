package repository

import (
	"context"
	"database/sql"

	db "api-golang/internal/db/sqlc"

	"github.com/google/uuid"
	"github.com/lib/pq"
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
	space, err := r.queries.CreateSpace(ctx, arg)
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			return db.Space{}, ErrSlugConflict
		}
		return db.Space{}, err
	}
	return space, nil
}

func (r *PostgresSpaceRepository) GetSpaceBySlug(ctx context.Context, arg db.GetSpaceBySlugParams) (db.Space, error) {
	return r.queries.GetSpaceBySlug(ctx, arg)
}

func (r *PostgresSpaceRepository) ListSpaces(ctx context.Context, userID uuid.UUID) ([]db.Space, error) {
	return r.queries.ListSpaces(ctx, userID)
}

func (r *PostgresSpaceRepository) UpdateSpaceName(ctx context.Context, arg db.UpdateSpaceNameParams) error {
	return r.queries.UpdateSpaceName(ctx, arg)
}

func (r *PostgresSpaceRepository) DeleteSpace(ctx context.Context, arg db.DeleteSpaceParams) error {
	return r.queries.DeleteSpace(ctx, arg)
}

func (r *PostgresSpaceRepository) GetBlocksBySpaceID(ctx context.Context, spaceID uuid.UUID) ([]db.Block, error) {
	return r.queries.GetBlocksBySpaceID(ctx, spaceID)
}

func (r *PostgresSpaceRepository) UpsertBlock(ctx context.Context, arg db.UpsertBlockParams) error {
	return r.queries.UpsertBlock(ctx, arg)
}

func (r *PostgresSpaceRepository) DeleteBlock(ctx context.Context, arg db.DeleteBlockParams) error {
	return r.queries.DeleteBlock(ctx, arg)
}
