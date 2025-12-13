-- Copyright (c) 2025 kk
--
-- This software is released under the MIT License.
-- https://opensource.org/licenses/MIT

-- Rename cdn_lines table fields:
-- display_name -> name (新的名称字段)
-- name -> code (新的代码字段)

-- Step 1: Drop existing unique constraint and index on display_name
ALTER TABLE cdn_lines DROP CONSTRAINT IF EXISTS cdn_lines_display_name_unique;
DROP INDEX IF EXISTS idx_cdn_lines_display_name_unique;

-- Step 2: Rename columns
-- First rename name to code (temporary name to avoid conflict)
ALTER TABLE cdn_lines RENAME COLUMN name TO code_temp;

-- Then rename display_name to name
ALTER TABLE cdn_lines RENAME COLUMN display_name TO name;

-- Finally rename code_temp to code
ALTER TABLE cdn_lines RENAME COLUMN code_temp TO code;

-- Step 3: Recreate unique constraint and index on the new name field
ALTER TABLE cdn_lines ADD CONSTRAINT cdn_lines_name_unique UNIQUE (name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cdn_lines_name_unique ON cdn_lines(name);

