-- name: GetRoomByID :one
SELECT id, status, created_at, updated_at
FROM rooms
WHERE id = $1
LIMIT 1;

-- name: GetAvailableRoomWithoutPlayerName :one
SELECT id, status, created_at, updated_at
FROM rooms
WHERE status = 'active'
AND NOT EXISTS (
	SELECT 1
	FROM players
	WHERE fk_room_id = rooms.id
	AND display_name = $1
)
LIMIT 1;

-- name: CountRooms :one
SELECT COUNT(*) FROM rooms WHERE status != 'deleted';

-- name: CreateRoom :one
INSERT INTO rooms (status) VALUES ($1) RETURNING id, status, created_at, updated_at;
