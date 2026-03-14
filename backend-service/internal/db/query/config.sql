-- name: GetConfigByID :one
SELECT id, key, value, description, created_at, updated_at
FROM configs
WHERE id = $1
LIMIT 1;
