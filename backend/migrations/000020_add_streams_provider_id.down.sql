-- Copyright (c) 2025 kk
--
-- This software is released under the MIT License.
-- https://opensource.org/licenses/MIT

-- Remove provider_id column from streams table
DROP INDEX IF EXISTS idx_streams_provider_id;
ALTER TABLE streams DROP COLUMN IF EXISTS provider_id;

