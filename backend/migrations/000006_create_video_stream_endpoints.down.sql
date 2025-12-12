-- Drop video_stream_endpoints table
DROP INDEX IF EXISTS idx_video_stream_endpoints_full_url;
DROP INDEX IF EXISTS idx_video_stream_endpoints_status;
DROP INDEX IF EXISTS idx_video_stream_endpoints_stream_path_id;
DROP INDEX IF EXISTS idx_video_stream_endpoints_stream_id;
DROP INDEX IF EXISTS idx_video_stream_endpoints_domain_id;
DROP INDEX IF EXISTS idx_video_stream_endpoints_line_id;
DROP INDEX IF EXISTS idx_video_stream_endpoints_provider_id;
DROP TABLE IF EXISTS video_stream_endpoints;

