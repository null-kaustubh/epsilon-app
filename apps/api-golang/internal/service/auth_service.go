package service

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"regexp"
	"time"

	db "api-golang/internal/db/sqlc"
	"api-golang/internal/email"

	"github.com/google/uuid"
	"golang.org/x/crypto/argon2"
)

var (
	ErrInvalidCredentials    = errors.New("invalid credentials")
	ErrWeakPassword          = errors.New("password does not meet requirements")
	ErrInvalidUsername       = errors.New("invalid username")
	ErrUsernameTaken         = errors.New("username already taken")
	ErrInvalidOrExpiredToken = errors.New("invalid or expired reset token")
	ErrInvalidEmail          = errors.New("invalid email address")
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
	CreatePasswordReset(ctx context.Context, userID uuid.UUID, token string, expiresAt time.Time) error
	GetPasswordResetByToken(ctx context.Context, token string) (db.PasswordReset, error)
	DeletePasswordResetsByUserID(ctx context.Context, userID uuid.UUID) error
	DeletePasswordResetByToken(ctx context.Context, token string) error
	UpdateUserPassword(ctx context.Context, userID uuid.UUID, passwordHash string) error
}

type AuthService struct {
	repo   AuthRepository
	email  *email.EmailService
	appURL string
}

func NewAuthService(repo AuthRepository, email *email.EmailService, appURL string) *AuthService {
	return &AuthService{repo: repo, email: email, appURL: appURL}
}

var (
	upper         = regexp.MustCompile(`[A-Z]`)
	lower         = regexp.MustCompile(`[a-z]`)
	num           = regexp.MustCompile(`[0-9]`)
	spec          = regexp.MustCompile(`[^A-Za-z0-9]`)
	usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_]{3,30}$`)
	emailRegex    = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
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

	go s.email.SendWelcome(user.Email, user.Username)

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

// --- GENERATE PW RESET TOKEN ---

func generateResetToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

// --- FORGOT PASSWORD ---

func (s *AuthService) ForgotPassword(ctx context.Context, email string) error {
	if !emailRegex.MatchString(email) {
		return ErrInvalidEmail
	}

	user, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		return nil
	}

	token, err := generateResetToken()
	if err != nil {
		return err
	}

	s.repo.DeletePasswordResetsByUserID(ctx, user.ID)

	expiresAt := time.Now().Add(1 * time.Hour)
	if err := s.repo.CreatePasswordReset(ctx, user.ID, token, expiresAt); err != nil {
		return err
	}

	go s.email.SendPasswordReset(user.Email, token, s.appURL)

	return nil
}

// --- RESET PASSWORD ---

func (s *AuthService) ResetPassword(ctx context.Context, token, newPassword string) error {
	if err := validatePassword(newPassword); err != nil {
		return err
	}

	reset, err := s.repo.GetPasswordResetByToken(ctx, token)
	if err != nil {
		return ErrInvalidOrExpiredToken
	}

	user, err := s.repo.GetUserByID(ctx, reset.UserID.String())
	if err != nil {
		return ErrInvalidOrExpiredToken
	}

	newHash := hashPassword(newPassword)
	if err := s.repo.UpdateUserPassword(ctx, user.ID, newHash); err != nil {
		return err
	}

	// token used — delete immediately
	s.repo.DeletePasswordResetByToken(ctx, token)

	// invalidate all sessions — force re-login with new password
	s.repo.DeleteSessionsByUserID(ctx, user.ID)

	return nil
}
