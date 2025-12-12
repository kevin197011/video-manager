-- Copyright (c) 2025 kk
--
-- This software is released under the MIT License.
-- https://opensource.org/licenses/MIT

-- Insert test data for video management system
-- This script inserts sample data for testing purposes

-- 1. Insert CDN Providers
INSERT INTO cdn_providers (name, code) VALUES
    ('火山引擎', 'volcano'),
    ('腾讯云', 'tencent'),
    ('网宿科技', 'wangsu')
ON CONFLICT (code) DO NOTHING;

-- 2. Insert CDN Lines (依赖 cdn_providers)
-- 使用 INSERT ... ON CONFLICT 避免重复，但 cdn_lines 表没有唯一约束，所以使用 NOT EXISTS
-- 火山引擎线路
INSERT INTO cdn_lines (provider_id, name, display_name)
SELECT id, 'kkw', 'bt-kkw' FROM cdn_providers WHERE code = 'volcano'
AND NOT EXISTS (SELECT 1 FROM cdn_lines WHERE provider_id = cdn_providers.id AND name = 'kkw' AND display_name = 'bt-kkw');

INSERT INTO cdn_lines (provider_id, name, display_name)
SELECT id, 'eu2', 'bt-eu2' FROM cdn_providers WHERE code = 'volcano'
AND NOT EXISTS (SELECT 1 FROM cdn_lines WHERE provider_id = cdn_providers.id AND name = 'eu2' AND display_name = 'bt-eu2');

INSERT INTO cdn_lines (provider_id, name, display_name)
SELECT id, 'eu3', 'bt-eu3' FROM cdn_providers WHERE code = 'volcano'
AND NOT EXISTS (SELECT 1 FROM cdn_lines WHERE provider_id = cdn_providers.id AND name = 'eu3' AND display_name = 'bt-eu3');

-- 腾讯云线路
INSERT INTO cdn_lines (provider_id, name, display_name)
SELECT id, 'kkw', 'tc-kkw' FROM cdn_providers WHERE code = 'tencent'
AND NOT EXISTS (SELECT 1 FROM cdn_lines WHERE provider_id = cdn_providers.id AND name = 'kkw' AND display_name = 'tc-kkw');

INSERT INTO cdn_lines (provider_id, name, display_name)
SELECT id, 'eu2', 'tc-eu2' FROM cdn_providers WHERE code = 'tencent'
AND NOT EXISTS (SELECT 1 FROM cdn_lines WHERE provider_id = cdn_providers.id AND name = 'eu2' AND display_name = 'tc-eu2');

INSERT INTO cdn_lines (provider_id, name, display_name)
SELECT id, 'eu3', 'tc-eu3' FROM cdn_providers WHERE code = 'tencent'
AND NOT EXISTS (SELECT 1 FROM cdn_lines WHERE provider_id = cdn_providers.id AND name = 'eu3' AND display_name = 'tc-eu3');

-- 网宿科技线路
INSERT INTO cdn_lines (provider_id, name, display_name)
SELECT id, 'kkw', 'cn-kkw' FROM cdn_providers WHERE code = 'wangsu'
AND NOT EXISTS (SELECT 1 FROM cdn_lines WHERE provider_id = cdn_providers.id AND name = 'kkw' AND display_name = 'cn-kkw');

INSERT INTO cdn_lines (provider_id, name, display_name)
SELECT id, 'eu2', 'cn-eu2' FROM cdn_providers WHERE code = 'wangsu'
AND NOT EXISTS (SELECT 1 FROM cdn_lines WHERE provider_id = cdn_providers.id AND name = 'eu2' AND display_name = 'cn-eu2');

INSERT INTO cdn_lines (provider_id, name, display_name)
SELECT id, 'eu3', 'cn-eu3' FROM cdn_providers WHERE code = 'wangsu'
AND NOT EXISTS (SELECT 1 FROM cdn_lines WHERE provider_id = cdn_providers.id AND name = 'eu3' AND display_name = 'cn-eu3');

-- 3. Insert Domains
INSERT INTO domains (name) VALUES
    ('a.com'),
    ('b.com')
ON CONFLICT (name) DO NOTHING;

-- 4. Insert Streams
INSERT INTO streams (name, code) VALUES
    ('亚洲区', 'kkw'),
    ('欧洲二区', 'eu2'),
    ('欧洲三区', 'eu3')
ON CONFLICT (code) DO NOTHING;

-- 5. Insert Stream Paths (依赖 streams)
-- Note: Handle both 'name' and 'table_id' column names for compatibility
-- kkw 的路径
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stream_paths' AND column_name = 'table_id') THEN
        INSERT INTO stream_paths (stream_id, table_id, full_path)
        SELECT id, 'k001', 'k03/k001' FROM streams WHERE code = 'kkw'
        ON CONFLICT DO NOTHING;
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stream_paths' AND column_name = 'name') THEN
        INSERT INTO stream_paths (stream_id, name, full_path)
        SELECT id, 'k001', 'k03/k001' FROM streams WHERE code = 'kkw'
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- eu2 的路径
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stream_paths' AND column_name = 'table_id') THEN
        INSERT INTO stream_paths (stream_id, table_id, full_path)
        SELECT id, 'e201', 'e203/e201' FROM streams WHERE code = 'eu2'
        ON CONFLICT DO NOTHING;
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stream_paths' AND column_name = 'name') THEN
        INSERT INTO stream_paths (stream_id, name, full_path)
        SELECT id, 'e201', 'e203/e201' FROM streams WHERE code = 'eu2'
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- eu3 的路径
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stream_paths' AND column_name = 'table_id') THEN
        INSERT INTO stream_paths (stream_id, table_id, full_path)
        SELECT id, 'e301', 'e303/e301' FROM streams WHERE code = 'eu3'
        ON CONFLICT DO NOTHING;
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stream_paths' AND column_name = 'name') THEN
        INSERT INTO stream_paths (stream_id, name, full_path)
        SELECT id, 'e301', 'e303/e301' FROM streams WHERE code = 'eu3'
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 6. Insert Video Stream Endpoints (依赖所有前面的表)
-- 注意：这里需要根据实际的 URL 生成规则来插入
-- URL 格式：https://{line_display_name}.{domain}/{stream_path_full_path}.flv
-- 为每个线路、域名、流路径的组合生成端点（每个组合只生成一次）

-- 插入所有可能的组合
INSERT INTO video_stream_endpoints (provider_id, line_id, domain_id, stream_id, stream_path_id, full_url, status)
SELECT DISTINCT
    l.provider_id,
    l.id,
    d.id,
    s.id,
    sp.id,
    'https://' || l.display_name || '.' || d.name || '/' || sp.full_path || '.flv',
    1
FROM cdn_lines l
CROSS JOIN domains d
CROSS JOIN streams s
CROSS JOIN stream_paths sp
WHERE sp.stream_id = s.id
  AND (
    (s.code = 'kkw' AND l.name = 'kkw') OR
    (s.code = 'eu2' AND l.name = 'eu2') OR
    (s.code = 'eu3' AND l.name = 'eu3')
  )
ON CONFLICT (line_id, domain_id, stream_path_id) DO NOTHING;

