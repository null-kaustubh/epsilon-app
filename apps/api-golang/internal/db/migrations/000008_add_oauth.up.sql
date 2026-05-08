ALTER TABLE users
    ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE users
    ADD COLUMN provider    text NOT NULL DEFAULT 'local',
    ADD COLUMN provider_id text;

ALTER TABLE users
    ADD CONSTRAINT chk_password_or_oauth
    CHECK (
        (provider = 'local' AND password_hash IS NOT NULL)
        OR
        (provider != 'local' AND password_hash IS NULL)
    );

CREATE UNIQUE INDEX users_provider_provider_id_idx
    ON users (provider, provider_id)
    WHERE provider_id IS NOT NULL;