-- name: CreatePasswordReset :one
INSERT INTO password_resets (id, user_id, token, expires_at)
VALUES (gen_random_uuid(), $1, $2, $3)
RETURNING *;

-- name: GetPasswordResetByToken :one
SELECT * FROM password_resets
WHERE token = $1 AND expires_at > NOW();

-- name: DeletePasswordResetsByUserID :exec
DELETE FROM password_resets WHERE user_id = $1;

-- name: DeletePasswordResetByToken :exec
DELETE FROM password_resets WHERE token = $1;