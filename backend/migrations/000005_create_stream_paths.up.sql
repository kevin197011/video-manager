-- Create stream_paths table
CREATE TABLE IF NOT EXISTS stream_paths (
    id BIGSERIAL PRIMARY KEY,
    stream_id BIGINT NOT NULL REFERENCES streams(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    full_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on stream_id for foreign key lookups
CREATE INDEX IF NOT EXISTS idx_stream_paths_stream_id ON stream_paths(stream_id);

-- Create index on full_path for search
CREATE INDEX IF NOT EXISTS idx_stream_paths_full_path ON stream_paths(full_path);

