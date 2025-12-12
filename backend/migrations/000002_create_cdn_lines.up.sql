-- Create cdn_lines table
CREATE TABLE IF NOT EXISTS cdn_lines (
    id BIGSERIAL PRIMARY KEY,
    provider_id BIGINT NOT NULL REFERENCES cdn_providers(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on provider_id for foreign key lookups
CREATE INDEX IF NOT EXISTS idx_cdn_lines_provider_id ON cdn_lines(provider_id);

-- Create index on name for search
CREATE INDEX IF NOT EXISTS idx_cdn_lines_name ON cdn_lines(name);

