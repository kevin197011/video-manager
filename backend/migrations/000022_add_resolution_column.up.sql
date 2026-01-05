-- Copyright (c) 2025 kk
--
-- This software is released under the MIT License.
-- https://opensource.org/licenses/MIT

-- Migration: Add resolution column to video_stream_endpoints table
-- Version: 22
-- Description: Adds resolution column to store video stream resolution (普清, 高清, 超清)

-- Add resolution column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'video_stream_endpoints' 
        AND column_name = 'resolution'
    ) THEN
        ALTER TABLE video_stream_endpoints 
        ADD COLUMN resolution VARCHAR(20) NOT NULL DEFAULT '普清';
        
        RAISE NOTICE 'Added resolution column to video_stream_endpoints table';
    ELSE
        RAISE NOTICE 'Resolution column already exists, skipping';
    END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_video_stream_endpoints_resolution 
ON video_stream_endpoints(resolution);

-- Update existing records to detect resolution from path if resolution is still default
-- This is a best-effort update based on path patterns
UPDATE video_stream_endpoints vse
SET resolution = CASE
    WHEN UPPER(sp.full_path) LIKE '%UHD%' OR UPPER(sp.full_path) LIKE '%4K%' THEN '超清'
    WHEN UPPER(sp.full_path) LIKE '%HD%' THEN '高清'
    WHEN UPPER(sp.full_path) LIKE '%SD%' THEN '普清'
    ELSE '普清'
END
FROM stream_paths sp
WHERE vse.stream_path_id = sp.id
AND vse.resolution = '普清';

