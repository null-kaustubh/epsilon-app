-- name: CreateSpace :one
INSERT INTO spaces (id, user_id, name, slug, description, icon_url)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetSpaceBySlug :one
SELECT id, user_id, name, slug, created_at, updated_at, description, icon_url
FROM spaces
WHERE slug = $1 AND user_id = $2;

-- name: ListSpaces :many
SELECT id, user_id, name, slug, created_at, updated_at, description, icon_url
FROM spaces
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: UpdateSpaceName :execrows
UPDATE spaces
SET name = $1, description = $2, icon_url = $3, updated_at = NOW()
WHERE slug = $4 AND user_id = $5;

-- name: DeleteSpace :execrows
DELETE FROM spaces
WHERE slug = $1 AND user_id = $2;

-- name: UpsertBlock :exec
INSERT INTO blocks (id, space_id, type, content, x, y, w, h, style)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
ON CONFLICT (id) DO UPDATE SET
    content    = EXCLUDED.content,
    x          = EXCLUDED.x,
    y          = EXCLUDED.y,
    w          = EXCLUDED.w,
    h          = EXCLUDED.h,
    style      = EXCLUDED.style,
    updated_at = NOW();

-- name: GetBlocksBySpaceID :many
SELECT * FROM blocks
WHERE space_id = $1
ORDER BY created_at ASC;

-- name: DeleteBlock :execrows
DELETE FROM blocks
WHERE id = $1 AND space_id = $2;