-- name: GetUserByUsername :one
SELECT id, username, hashed_password, created_at, updated_at
FROM users
WHERE username = $1
LIMIT 1;

-- name: CreateUser :one
INSERT INTO users (username, hashed_password)
VALUES ($1, $2)
RETURNING id, username, hashed_password, created_at, updated_at;
