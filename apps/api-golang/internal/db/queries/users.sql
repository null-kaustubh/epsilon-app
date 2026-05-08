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

-- name: UpdateUserPassword :exec
UPDATE users SET password_hash = $1 WHERE id = $2;

-- name: GetUserByProviderID :one
SELECT * FROM users
WHERE provider = $1
  AND provider_id = $2
LIMIT 1;

-- name: CreateOAuthUser :one
INSERT INTO users (id, email, username, provider, provider_id, created_at)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;