-- Create video_stream_endpoints table
CREATE TABLE IF NOT EXISTS video_stream_endpoints (
    id BIGSERIAL PRIMARY KEY,
    provider_id BIGINT NOT NULL REFERENCES cdn_providers(id) ON DELETE RESTRICT,
    line_id BIGINT NOT NULL REFERENCES cdn_lines(id) ON DELETE RESTRICT,
    domain_id BIGINT NOT NULL REFERENCES domains(id) ON DELETE RESTRICT,
    stream_id BIGINT NOT NULL REFERENCES streams(id) ON DELETE RESTRICT,
    stream_path_id BIGINT NOT NULL REFERENCES stream_paths(id) ON DELETE RESTRICT,
    full_url VARCHAR(1000) NOT NULL,
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(line_id, domain_id, stream_path_id)
);

-- Create indexes for foreign key lookups and filtering
CREATE INDEX IF NOT EXISTS idx_video_stream_endpoints_provider_id ON video_stream_endpoints(provider_id);
CREATE INDEX IF NOT EXISTS idx_video_stream_endpoints_line_id ON video_stream_endpoints(line_id);
CREATE INDEX IF NOT EXISTS idx_video_stream_endpoints_domain_id ON video_stream_endpoints(domain_id);
CREATE INDEX IF NOT EXISTS idx_video_stream_endpoints_stream_id ON video_stream_endpoints(stream_id);
CREATE INDEX IF NOT EXISTS idx_video_stream_endpoints_stream_path_id ON video_stream_endpoints(stream_path_id);
CREATE INDEX IF NOT EXISTS idx_video_stream_endpoints_status ON video_stream_endpoints(status);
CREATE INDEX IF NOT EXISTS idx_video_stream_endpoints_full_url ON video_stream_endpoints(full_url);

