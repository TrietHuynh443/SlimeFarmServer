-- +goose Up
ALTER TABLE players
ADD CONSTRAINT displayname_unique_per_room UNIQUE (display_name, fk_room_id);

ALTER TABLE players
ALTER COLUMN display_name DROP NOT NULL;

-- +goose Down
ALTER TABLE players
DROP CONSTRAINT IF EXISTS displayname_unique_per_room;

ALTER TABLE players
ALTER COLUMN display_name SET NOT NULL;
