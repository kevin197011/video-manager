-- Create streams table
CREATE TABLE IF NOT EXISTS streams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on code
CREATE UNIQUE INDEX IF NOT EXISTS idx_streams_code ON streams(code);

-- Create index on name for search
CREATE INDEX IF NOT EXISTS idx_streams_name ON streams(name);

