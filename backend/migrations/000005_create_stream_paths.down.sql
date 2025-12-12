-- Drop stream_paths table
DROP INDEX IF EXISTS idx_stream_paths_full_path;
DROP INDEX IF EXISTS idx_stream_paths_stream_id;
DROP TABLE IF EXISTS stream_paths;

