-- Copyright (c) 2025 kk
--
-- This software is released under the MIT License.
-- https://opensource.org/licenses/MIT

-- ============================================================================
-- Video Manager Database Schema - Complete Initialization Script
-- ============================================================================
-- This script creates all tables, indexes, constraints, and inserts test data
-- for a fresh deployment. Run this script once on a new database.
-- ============================================================================

-- ============================================================================
-- 1. Create Tables
-- ============================================================================

-- Create cdn_providers table
CREATE TABLE IF NOT EXISTS cdn_providers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cdn_lines table
-- name: 名称 (原 display_name)
-- code: 代码 (原 name)
CREATE TABLE IF NOT EXISTS cdn_lines (
    id BIGSERIAL PRIMARY KEY,
    provider_id BIGINT NOT NULL REFERENCES cdn_providers(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create domains table
CREATE TABLE IF NOT EXISTS domains (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create streams table
-- provider_id: NULL means match all providers, specific provider_id means match only that provider
CREATE TABLE IF NOT EXISTS streams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    provider_id BIGINT REFERENCES cdn_providers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stream_paths table (using table_id directly, not name)
CREATE TABLE IF NOT EXISTS stream_paths (
    id BIGSERIAL PRIMARY KEY,
    stream_id BIGINT NOT NULL REFERENCES streams(id) ON DELETE RESTRICT,
    table_id VARCHAR(255) NOT NULL,
    full_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tokens table
CREATE TABLE IF NOT EXISTS tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    never_expire BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schema_migrations table (for migration tracking)
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. Create Indexes
-- ============================================================================

-- cdn_providers indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_cdn_providers_code ON cdn_providers(code);
CREATE INDEX IF NOT EXISTS idx_cdn_providers_name ON cdn_providers(name);

-- cdn_lines indexes
CREATE INDEX IF NOT EXISTS idx_cdn_lines_provider_id ON cdn_lines(provider_id);
CREATE INDEX IF NOT EXISTS idx_cdn_lines_name ON cdn_lines(name);

-- domains indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_domains_name ON domains(name);

-- streams indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_streams_code ON streams(code);
CREATE INDEX IF NOT EXISTS idx_streams_name ON streams(name);
CREATE INDEX IF NOT EXISTS idx_streams_provider_id ON streams(provider_id);

-- stream_paths indexes
CREATE INDEX IF NOT EXISTS idx_stream_paths_stream_id ON stream_paths(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_paths_full_path ON stream_paths(full_path);

-- video_stream_endpoints indexes
CREATE INDEX IF NOT EXISTS idx_video_stream_endpoints_provider_id ON video_stream_endpoints(provider_id);
CREATE INDEX IF NOT EXISTS idx_video_stream_endpoints_line_id ON video_stream_endpoints(line_id);
CREATE INDEX IF NOT EXISTS idx_video_stream_endpoints_domain_id ON video_stream_endpoints(domain_id);
CREATE INDEX IF NOT EXISTS idx_video_stream_endpoints_stream_id ON video_stream_endpoints(stream_id);
CREATE INDEX IF NOT EXISTS idx_video_stream_endpoints_stream_path_id ON video_stream_endpoints(stream_path_id);
CREATE INDEX IF NOT EXISTS idx_video_stream_endpoints_status ON video_stream_endpoints(status);
CREATE INDEX IF NOT EXISTS idx_video_stream_endpoints_full_url ON video_stream_endpoints(full_url);

-- users indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- tokens indexes
CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_token_hash ON tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_tokens_expires_at ON tokens(expires_at);

-- ============================================================================
-- 3. Create Unique Constraints
-- ============================================================================

-- cdn_providers unique constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'cdn_providers' AND constraint_name = 'cdn_providers_name_unique'
    ) THEN
ALTER TABLE cdn_providers ADD CONSTRAINT cdn_providers_name_unique UNIQUE (name);
    END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS idx_cdn_providers_name_unique ON cdn_providers(name);

-- cdn_lines unique constraints (on name)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'cdn_lines' AND constraint_name = 'cdn_lines_name_unique'
    ) THEN
ALTER TABLE cdn_lines ADD CONSTRAINT cdn_lines_name_unique UNIQUE (name);
    END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS idx_cdn_lines_name_unique ON cdn_lines(name);

-- streams unique constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'streams' AND constraint_name = 'streams_name_unique'
    ) THEN
ALTER TABLE streams ADD CONSTRAINT streams_name_unique UNIQUE (name);
    END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS idx_streams_name_unique ON streams(name);

-- stream_paths unique constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'stream_paths' AND constraint_name = 'stream_paths_table_id_unique'
    ) THEN
ALTER TABLE stream_paths ADD CONSTRAINT stream_paths_table_id_unique UNIQUE (table_id);
    END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS idx_stream_paths_table_id_unique ON stream_paths(table_id);

-- tokens unique constraints (per user)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'tokens' AND constraint_name = 'tokens_user_name_unique'
    ) THEN
ALTER TABLE tokens ADD CONSTRAINT tokens_user_name_unique UNIQUE (user_id, name);
    END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tokens_user_name_unique ON tokens(user_id, name);

-- ============================================================================
-- 4. Insert Test Data
-- ============================================================================

-- Insert CDN Providers
INSERT INTO cdn_providers (name, code) VALUES
    ('火山引擎', 'volcano'),
    ('腾讯云', 'tencent'),
    ('网宿科技', 'wangsu')
ON CONFLICT (code) DO NOTHING;

-- Insert CDN Lines
-- name: 名称 (原 display_name), code: 代码 (原 name)
INSERT INTO cdn_lines (provider_id, name, code)
SELECT id, 'bt-kkw', 'kkw' FROM cdn_providers WHERE code = 'volcano'
ON CONFLICT (name) DO NOTHING;

INSERT INTO cdn_lines (provider_id, name, code)
SELECT id, 'bt-eu2', 'eu2' FROM cdn_providers WHERE code = 'volcano'
ON CONFLICT (name) DO NOTHING;

INSERT INTO cdn_lines (provider_id, name, code)
SELECT id, 'bt-eu3', 'eu3' FROM cdn_providers WHERE code = 'volcano'
ON CONFLICT (name) DO NOTHING;

INSERT INTO cdn_lines (provider_id, name, code)
SELECT id, 'tc-kkw', 'kkw' FROM cdn_providers WHERE code = 'tencent'
ON CONFLICT (name) DO NOTHING;

INSERT INTO cdn_lines (provider_id, name, code)
SELECT id, 'tc-eu2', 'eu2' FROM cdn_providers WHERE code = 'tencent'
ON CONFLICT (name) DO NOTHING;

INSERT INTO cdn_lines (provider_id, name, code)
SELECT id, 'tc-eu3', 'eu3' FROM cdn_providers WHERE code = 'tencent'
ON CONFLICT (name) DO NOTHING;

INSERT INTO cdn_lines (provider_id, name, code)
SELECT id, 'cn-kkw', 'kkw' FROM cdn_providers WHERE code = 'wangsu'
ON CONFLICT (name) DO NOTHING;

INSERT INTO cdn_lines (provider_id, name, code)
SELECT id, 'cn-eu2', 'eu2' FROM cdn_providers WHERE code = 'wangsu'
ON CONFLICT (name) DO NOTHING;

INSERT INTO cdn_lines (provider_id, name, code)
SELECT id, 'cn-eu3', 'eu3' FROM cdn_providers WHERE code = 'wangsu'
ON CONFLICT (name) DO NOTHING;

-- Insert Domains
INSERT INTO domains (name) VALUES
    ('a.com'),
    ('b.com')
ON CONFLICT (name) DO NOTHING;

-- Insert Streams
-- provider_id = NULL means match all providers with matching line name
-- provider_id = specific value means match only that provider
INSERT INTO streams (name, code, provider_id) VALUES
    ('亚洲区', 'kkw', NULL),
    ('欧洲二区', 'eu2', NULL),
    ('欧洲三区', 'eu3', NULL)
ON CONFLICT (code) DO NOTHING;

-- Insert Stream Paths
INSERT INTO stream_paths (stream_id, table_id, full_path)
SELECT id, 'k001', 'k03/k001' FROM streams WHERE code = 'kkw'
ON CONFLICT (table_id) DO NOTHING;

INSERT INTO stream_paths (stream_id, table_id, full_path)
SELECT id, 'e201', 'e203/e201' FROM streams WHERE code = 'eu2'
ON CONFLICT (table_id) DO NOTHING;

INSERT INTO stream_paths (stream_id, table_id, full_path)
SELECT id, 'e301', 'e303/e301' FROM streams WHERE code = 'eu3'
ON CONFLICT (table_id) DO NOTHING;

-- Insert Video Stream Endpoints
-- Match rule: line.name == stream.code AND (stream.provider_id IS NULL OR line.provider_id == stream.provider_id)
INSERT INTO video_stream_endpoints (provider_id, line_id, domain_id, stream_id, stream_path_id, full_url, status)
SELECT DISTINCT
    l.provider_id,
    l.id,
    d.id,
    s.id,
    sp.id,
    'https://' || l.name || '.' || d.name || '/' || sp.full_path || '.flv',
    1
FROM cdn_lines l
CROSS JOIN domains d
CROSS JOIN streams s
CROSS JOIN stream_paths sp
WHERE sp.stream_id = s.id
  AND l.name = s.code
  AND (s.provider_id IS NULL OR l.provider_id = s.provider_id)
ON CONFLICT (line_id, domain_id, stream_path_id) DO NOTHING;

-- ============================================================================
-- Initialization Complete
-- ============================================================================
-- Note: Admin user will be created by the application on startup
-- using the ADMIN_USERNAME and ADMIN_PASSWORD environment variables
-- ============================================================================
