-- name: GetPlayerByID :one
SELECT id, fk_room_id, display_name, created_at, updated_at
FROM players
WHERE id = $1
LIMIT 1;

-- name: CreatePlayer :one
INSERT INTO players (fk_room_id, display_name)
VALUES ($1, $2)
RETURNING id, fk_room_id, display_name, created_at, updated_at;
