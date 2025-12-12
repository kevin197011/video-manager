-- Create cdn_providers table
CREATE TABLE IF NOT EXISTS cdn_providers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on code
CREATE UNIQUE INDEX IF NOT EXISTS idx_cdn_providers_code ON cdn_providers(code);

-- Create index on name for search
CREATE INDEX IF NOT EXISTS idx_cdn_providers_name ON cdn_providers(name);

