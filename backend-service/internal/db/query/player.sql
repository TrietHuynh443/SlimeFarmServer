-- name: GetPlayerByID :one
SELECT id, fk_user_id, fk_room_id, display_name, created_at, updated_at
FROM players
WHERE id = $1
LIMIT 1;

-- name: GetPlayerByUserID :one
SELECT id, fk_user_id, fk_room_id, display_name, created_at, updated_at
FROM players
WHERE fk_user_id = $1
LIMIT 1;

-- name: CreatePlayer :one
INSERT INTO players (fk_user_id, fk_room_id, display_name)
VALUES (
  sqlc.arg(fk_user_id),
  sqlc.narg(fk_room_id),
  sqlc.narg(display_name)
)
RETURNING id, fk_user_id, fk_room_id, display_name, created_at, updated_at;

-- name: UpdatePlayer :one
UPDATE players
SET
  fk_room_id = COALESCE(sqlc.narg(fk_room_id), fk_room_id),
  display_name = COALESCE(sqlc.narg(display_name), display_name)
WHERE id = sqlc.arg(id)
RETURNING id, fk_user_id, fk_room_id, display_name, created_at, updated_at;
