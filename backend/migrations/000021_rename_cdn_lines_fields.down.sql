-- Copyright (c) 2025 kk
--
-- This software is released under the MIT License.
-- https://opensource.org/licenses/MIT

-- Reverse the field renaming:
-- name -> display_name
-- code -> name

-- Step 1: Drop existing unique constraint and index on name
ALTER TABLE cdn_lines DROP CONSTRAINT IF EXISTS cdn_lines_name_unique;
DROP INDEX IF EXISTS idx_cdn_lines_name_unique;

-- Step 2: Rename columns back
-- First rename name to display_name (temporary name to avoid conflict)
ALTER TABLE cdn_lines RENAME COLUMN name TO display_name_temp;

-- Then rename code to name
ALTER TABLE cdn_lines RENAME COLUMN code TO name;

-- Finally rename display_name_temp to display_name
ALTER TABLE cdn_lines RENAME COLUMN display_name_temp TO display_name;

-- Step 3: Recreate unique constraint and index on display_name
ALTER TABLE cdn_lines ADD CONSTRAINT cdn_lines_display_name_unique UNIQUE (display_name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cdn_lines_display_name_unique ON cdn_lines(display_name);

