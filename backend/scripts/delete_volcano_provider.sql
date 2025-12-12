-- Copyright (c) 2025 kk
--
-- This software is released under the MIT License.
-- https://opensource.org/licenses/MIT

-- 删除火山引擎（volcano）及其所有关联数据
-- 删除顺序：video_stream_endpoints -> cdn_lines -> cdn_providers

BEGIN;

-- 1. 删除所有与火山引擎相关的视频流端点
DELETE FROM video_stream_endpoints
WHERE provider_id IN (
    SELECT id FROM cdn_providers WHERE code = 'volcano'
);

-- 2. 删除所有与火山引擎相关的线路
DELETE FROM cdn_lines
WHERE provider_id IN (
    SELECT id FROM cdn_providers WHERE code = 'volcano'
);

-- 3. 删除火山引擎提供商
DELETE FROM cdn_providers
WHERE code = 'volcano';

COMMIT;

-- 验证删除结果
SELECT 'Deleted providers:' as info, COUNT(*) as count FROM cdn_providers WHERE code = 'volcano';
SELECT 'Remaining lines:' as info, COUNT(*) as count FROM cdn_lines WHERE provider_id IN (SELECT id FROM cdn_providers WHERE code = 'volcano');
SELECT 'Remaining endpoints:' as info, COUNT(*) as count FROM video_stream_endpoints WHERE provider_id IN (SELECT id FROM cdn_providers WHERE code = 'volcano');

