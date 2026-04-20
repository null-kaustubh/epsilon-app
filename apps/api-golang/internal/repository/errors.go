package repository

import "errors"

var (
	ErrUserExists      = errors.New("user already exists")
	ErrUserNotFound    = errors.New("user not found")
	ErrSessionNotFound = errors.New("session not found")

	ErrSpaceNotFound = errors.New("space not found")
	ErrBlockNotFound = errors.New("block not found")

	ErrInvalidBlockType       = errors.New("invalid block type")
	ErrInvalidBlockDimensions = errors.New("invalid block dimensions")

	ErrInvalidSpaceName = errors.New("invalid space name")
	ErrSpaceNameTooLong = errors.New("space name too long")

	ErrUsernameTaken   = errors.New("username already taken")
	ErrInvalidUsername = errors.New("invalid username")
)
