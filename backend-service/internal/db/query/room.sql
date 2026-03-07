-- name: GetRoomByID :one
SELECT id, status, created_at, updated_at
FROM rooms
WHERE id = $1
LIMIT 1;
