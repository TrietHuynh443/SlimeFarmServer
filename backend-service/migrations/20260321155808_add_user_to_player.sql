-- +goose Up
ALTER TABLE players
ADD COLUMN fk_user_id BIGINT,
ADD CONSTRAINT players_fk_user_id_fkey
    FOREIGN KEY (fk_user_id) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT players_fk_user_id_unique UNIQUE (fk_user_id);

-- +goose Down
ALTER TABLE players
DROP CONSTRAINT IF EXISTS players_fk_user_id_unique,
DROP CONSTRAINT IF EXISTS players_fk_user_id_fkey,
DROP COLUMN IF EXISTS fk_user_id;
