-- name: GetPlayerByID :one
SELECT id, fk_room_id, display_name, created_at, updated_at
FROM players
WHERE id = $1
LIMIT 1;
