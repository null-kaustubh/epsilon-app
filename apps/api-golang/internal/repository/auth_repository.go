package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"

	db "api-golang/internal/db/sqlc"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type PostgresAuthRepository struct {
	queries *db.Queries
}

func NewPostgresAuthRepository(conn *sql.DB) *PostgresAuthRepository {
	return &PostgresAuthRepository{
		queries: db.New(conn),
	}
}

// --- USER ---

func (r *PostgresAuthRepository) CreateUser(ctx context.Context, user db.User) error {
	_, err := r.queries.CreateUser(ctx, db.CreateUserParams{
		ID:           user.ID,
		Email:        user.Email,
		PasswordHash: user.PasswordHash,
		Username:     user.Username,
	})
	if err != nil {
		// postgres unique violation code
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			return ErrUserExists
		}
		return err
	}
	return nil
}

func (r *PostgresAuthRepository) CreateOAuthUser(ctx context.Context, user db.User) error {
	_, err := r.queries.CreateOAuthUser(ctx, db.CreateOAuthUserParams{
		ID:         user.ID,
		Email:      user.Email,
		Username:   user.Username,
		Provider:   user.Provider,
		ProviderID: user.ProviderID,
	})
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			return ErrUserExists
		}
		return err
	}
	return nil
}

func (r *PostgresAuthRepository) CheckUsernameExists(ctx context.Context, username string) (bool, error) {
	return r.queries.CheckUsernameExists(ctx, username)
}

func (r *PostgresAuthRepository) GetUserByUsername(ctx context.Context, username string) (db.User, error) {
	u, err := r.queries.GetUserByUsername(ctx, username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return db.User{}, ErrUserNotFound
		}
		return db.User{}, err
	}
	return u, nil
}

func (r *PostgresAuthRepository) GetUserByEmail(ctx context.Context, email string) (db.User, error) {
	u, err := r.queries.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return db.User{}, ErrUserNotFound
		}
		return db.User{}, err
	}

	return u, nil
}

func (r *PostgresAuthRepository) GetUserByID(ctx context.Context, id string) (db.User, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return db.User{}, err
	}

	u, err := r.queries.GetUserByID(ctx, uid)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return db.User{}, ErrUserNotFound
		}
		return db.User{}, err
	}

	return u, nil
}

func (r *PostgresAuthRepository) GetUserByProviderID(ctx context.Context, provider, providerID string) (db.User, error) {
	u, err := r.queries.GetUserByProviderID(ctx, db.GetUserByProviderIDParams{
		Provider:   provider,
		ProviderID: sql.NullString{String: providerID, Valid: true},
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return db.User{}, ErrUserNotFound
		}
		return db.User{}, err
	}
	return u, nil
}

// --- SESSION ---

func (r *PostgresAuthRepository) CreateSession(ctx context.Context, session db.Session) error {
	_, err := r.queries.CreateSession(ctx, db.CreateSessionParams{
		ID:        session.ID,
		UserID:    session.UserID,
		ExpiresAt: session.ExpiresAt,
	})
	return err
}

func (r *PostgresAuthRepository) GetSession(ctx context.Context, id string) (db.Session, error) {
	s, err := r.queries.GetSession(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return db.Session{}, ErrSessionNotFound
		}
		return db.Session{}, err
	}

	return s, nil
}

func (r *PostgresAuthRepository) DeleteSession(ctx context.Context, id string) error {
	return r.queries.DeleteSession(ctx, id)
}

func (r *PostgresAuthRepository) DeleteSessionsByUserID(ctx context.Context, userID uuid.UUID) error {
	return r.queries.DeleteSessionsByUserID(ctx, userID)
}

func (r *PostgresAuthRepository) CreatePasswordReset(ctx context.Context, userID uuid.UUID, token string, expiresAt time.Time) error {
	_, err := r.queries.CreatePasswordReset(ctx, db.CreatePasswordResetParams{
		UserID:    userID,
		Token:     token,
		ExpiresAt: expiresAt,
	})
	return err
}

func (r *PostgresAuthRepository) GetPasswordResetByToken(ctx context.Context, token string) (db.PasswordReset, error) {
	return r.queries.GetPasswordResetByToken(ctx, token)
}

func (r *PostgresAuthRepository) DeletePasswordResetsByUserID(ctx context.Context, userID uuid.UUID) error {
	return r.queries.DeletePasswordResetsByUserID(ctx, userID)
}

func (r *PostgresAuthRepository) DeletePasswordResetByToken(ctx context.Context, token string) error {
	return r.queries.DeletePasswordResetByToken(ctx, token)
}

func (r *PostgresAuthRepository) UpdateUserPassword(ctx context.Context, userID uuid.UUID, passwordHash string) error {
	return r.queries.UpdateUserPassword(ctx, db.UpdateUserPasswordParams{
		PasswordHash: sql.NullString{String: passwordHash, Valid: true},
		ID:           userID,
	})
}
