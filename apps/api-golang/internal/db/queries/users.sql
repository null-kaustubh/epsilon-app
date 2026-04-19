-- name: CreateUser :one
INSERT INTO users (id, email, password_hash, username)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: GetUserByUsername :one
SELECT * FROM users WHERE lower(username) = lower($1);

-- name: CheckUsernameExists :one
SELECT EXISTS(SELECT 1 FROM users WHERE lower(username) = lower($1)) AS exists;