-- name: GetCredentialByName :one
SELECT id, name, value, created_at, updated_at
FROM credentials
WHERE name = $1
LIMIT 1;
