package service

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"regexp"
	"time"

	db "api-golang/internal/db/sqlc"

	"github.com/google/uuid"
	"golang.org/x/crypto/argon2"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrWeakPassword       = errors.New("password does not meet requirements")
	ErrInvalidUsername    = errors.New("invalid username")
	ErrUsernameTaken      = errors.New("username already taken")
)

// --- INTERFACE ---

type AuthRepository interface {
	CreateUser(ctx context.Context, user db.User) error
	GetUserByEmail(ctx context.Context, email string) (db.User, error)
	GetUserByID(ctx context.Context, id string) (db.User, error)
	CreateSession(ctx context.Context, session db.Session) error
	GetSession(ctx context.Context, id string) (db.Session, error)
	DeleteSession(ctx context.Context, id string) error
	DeleteSessionsByUserID(ctx context.Context, userID uuid.UUID) error
	CheckUsernameExists(ctx context.Context, username string) (bool, error)
}

type AuthService struct {
	repo AuthRepository
}

func NewAuthService(repo AuthRepository) *AuthService {
	return &AuthService{repo: repo}
}

var (
	upper         = regexp.MustCompile(`[A-Z]`)
	lower         = regexp.MustCompile(`[a-z]`)
	num           = regexp.MustCompile(`[0-9]`)
	spec          = regexp.MustCompile(`[^A-Za-z0-9]`)
	usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_]{3,30}$`)
)

// --- PASSWORD & USERNAME VALIDATION ---

func validatePassword(password string) error {
	if len(password) < 8 {
		return ErrWeakPassword
	}

	if !upper.MatchString(password) ||
		!lower.MatchString(password) ||
		!num.MatchString(password) ||
		!spec.MatchString(password) {
		return ErrWeakPassword
	}

	return nil
}

func validateUsername(username string) error {
	if !usernameRegex.MatchString(username) {
		return ErrInvalidUsername
	}
	return nil
}

// --- HASHING ---

func hashPassword(password string) string {
	salt := make([]byte, 16)
	rand.Read(salt)

	hash := argon2.IDKey([]byte(password), salt, 1, 64*1024, 4, 32)
	return base64.RawStdEncoding.EncodeToString(append(salt, hash...))
}

func comparePassword(stored, password string) bool {
	data, err := base64.RawStdEncoding.DecodeString(stored)
	if err != nil {
		return false
	}

	salt := data[:16]
	hash := data[16:]

	newHash := argon2.IDKey([]byte(password), salt, 1, 64*1024, 4, 32)

	return string(hash) == string(newHash)
}

// --- SESSION ---

func generateSessionID() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

// --- REGISTER ---

func (s *AuthService) Register(ctx context.Context, email, password, username string) (db.User, string, error) {
	if err := validatePassword(password); err != nil {
		return db.User{}, "", err
	}

	if err := validateUsername(username); err != nil {
		return db.User{}, "", err
	}

	exists, err := s.repo.CheckUsernameExists(ctx, username)
	if err != nil {
		return db.User{}, "", err
	}
	if exists {
		return db.User{}, "", ErrUsernameTaken
	}

	user := db.User{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: hashPassword(password),
		Username:     username,
		CreatedAt:    time.Now(),
	}

	if err := s.repo.CreateUser(ctx, user); err != nil {
		return db.User{}, "", err
	}

	sessionID, err := generateSessionID()
	if err != nil {
		return db.User{}, "", err
	}

	session := db.Session{
		ID:        sessionID,
		UserID:    user.ID,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
		CreatedAt: time.Now(),
	}

	if err := s.repo.CreateSession(ctx, session); err != nil {
		return db.User{}, "", err
	}

	return user, sessionID, nil
}

// --- LOGIN ---

func (s *AuthService) Login(ctx context.Context, email, password string) (db.User, string, error) {
	user, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		return db.User{}, "", ErrInvalidCredentials
	}

	if !comparePassword(user.PasswordHash, password) {
		return db.User{}, "", ErrInvalidCredentials
	}

	sessionID, err := generateSessionID()
	if err != nil {
		return db.User{}, "", err
	}

	session := db.Session{
		ID:        sessionID,
		UserID:    user.ID,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
		CreatedAt: time.Now(),
	}

	// invalidate all previous sessions
	s.repo.DeleteSessionsByUserID(ctx, user.ID)

	if err := s.repo.CreateSession(ctx, session); err != nil {
		return db.User{}, "", err
	}

	return user, sessionID, nil
}

// --- GET USER FROM SESSION ---

func (s *AuthService) GetUserFromSession(ctx context.Context, sessionID string) (db.User, error) {
	session, err := s.repo.GetSession(ctx, sessionID)
	if err != nil {
		return db.User{}, ErrInvalidCredentials
	}

	return s.repo.GetUserByID(ctx, session.UserID.String())
}

// --- LOGOUT ---

func (s *AuthService) Logout(ctx context.Context, sessionID string) error {
	return s.repo.DeleteSession(ctx, sessionID)
}
