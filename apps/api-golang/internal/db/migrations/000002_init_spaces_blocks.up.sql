CREATE TABLE spaces (
    id         UUID PRIMARY KEY,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       TEXT NOT NULL DEFAULT 'Untitled',
    slug       TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blocks (
    id         UUID PRIMARY KEY,
    space_id   UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    type       TEXT NOT NULL,
    content    TEXT NOT NULL DEFAULT '',
    x          INTEGER NOT NULL DEFAULT 0,
    y          INTEGER NOT NULL DEFAULT 0,
    w          INTEGER NOT NULL DEFAULT 4,
    h          INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_spaces_user_id ON spaces(user_id);
CREATE INDEX idx_blocks_space_id ON blocks(space_id);