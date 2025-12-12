-- Copyright (c) 2025 kk
--
-- This software is released under the MIT License.
-- https://opensource.org/licenses/MIT

-- Rename name column to table_id in stream_paths table
-- Only rename if name column exists and table_id doesn't exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'stream_paths' AND column_name = 'name'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'stream_paths' AND column_name = 'table_id'
    ) THEN
        ALTER TABLE stream_paths RENAME COLUMN name TO table_id;
    END IF;
END $$;

