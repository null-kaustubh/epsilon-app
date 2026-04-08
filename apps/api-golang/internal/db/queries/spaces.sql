-- name: CreateSpace :one
INSERT INTO spaces (id, user_id, name, slug)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetSpaceBySlug :one
SELECT * FROM spaces
WHERE slug = $1 AND user_id = $2;

-- name: ListSpaces :many
SELECT * FROM spaces
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: UpdateSpaceName :exec
UPDATE spaces
SET name = $1, updated_at = NOW()
WHERE slug = $2 AND user_id = $3;

-- name: DeleteSpace :exec
DELETE FROM spaces
WHERE slug = $1 AND user_id = $2;

-- name: UpsertBlock :exec
INSERT INTO blocks (id, space_id, type, content, x, y, w, h)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (id) DO UPDATE SET
    content    = EXCLUDED.content,
    x          = EXCLUDED.x,
    y          = EXCLUDED.y,
    w          = EXCLUDED.w,
    h          = EXCLUDED.h,
    updated_at = NOW();

-- name: GetBlocksBySpaceID :many
SELECT * FROM blocks
WHERE space_id = $1
ORDER BY created_at ASC;

-- name: DeleteBlock :exec
DELETE FROM blocks
WHERE id = $1 AND space_id = $2;