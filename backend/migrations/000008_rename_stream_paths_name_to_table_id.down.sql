-- Copyright (c) 2025 kk
--
-- This software is released under the MIT License.
-- https://opensource.org/licenses/MIT

-- Revert: rename table_id column back to name
ALTER TABLE stream_paths RENAME COLUMN table_id TO name;

