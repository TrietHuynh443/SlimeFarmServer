-- +goose Up
INSERT INTO configs (key, value, description)
VALUES (
    'start_positions',
    '[[0, 0]]'::jsonb,
    'Valid start positions of a player when they join a room'
)
ON CONFLICT (key) DO NOTHING;

-- +goose Down
DELETE FROM configs WHERE key = 'start_positions';
