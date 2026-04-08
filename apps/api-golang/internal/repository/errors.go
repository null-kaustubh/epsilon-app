package repository

import "errors"

var (
	ErrUserExists      = errors.New("user already exists")
	ErrUserNotFound    = errors.New("user not found")
	ErrSessionNotFound = errors.New("session not found")
	ErrSpaceNotFound   = errors.New("space not found")
	ErrSlugConflict    = errors.New("slug already exists")
)
