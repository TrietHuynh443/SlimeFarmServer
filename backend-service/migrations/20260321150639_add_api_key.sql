-- +goose Up
INSERT INTO credentials (name, value)
VALUES (
    'api_key',
    'change-me'
)
ON CONFLICT (name) DO NOTHING;

-- +goose Down
DELETE FROM credentials WHERE name = 'api_key';
