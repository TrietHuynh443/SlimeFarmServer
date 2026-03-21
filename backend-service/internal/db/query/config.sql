-- name: GetConfigByID :one
SELECT id, key, value, description, created_at, updated_at
FROM configs
WHERE id = $1
LIMIT 1;

-- name: ListConfigs :many
SELECT id, key, value, description, created_at, updated_at
FROM configs
ORDER BY created_at DESC;

-- name: UpdateConfig :one
UPDATE configs
SET value = $2
WHERE key = $1
RETURNING id, key, value, description, created_at, updated_at;
