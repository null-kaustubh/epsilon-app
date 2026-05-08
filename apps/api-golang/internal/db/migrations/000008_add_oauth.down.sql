DROP INDEX IF EXISTS users_provider_provider_id_idx;

ALTER TABLE users
    DROP CONSTRAINT IF EXISTS chk_password_or_oauth;

ALTER TABLE users
    DROP COLUMN IF EXISTS provider_id,
    DROP COLUMN IF EXISTS provider;

ALTER TABLE users
    ALTER COLUMN password_hash SET NOT NULL;
