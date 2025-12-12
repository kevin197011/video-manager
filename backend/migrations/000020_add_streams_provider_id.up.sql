-- Copyright (c) 2025 kk
--
-- This software is released under the MIT License.
-- https://opensource.org/licenses/MIT

-- Add provider_id column to streams table for associating streams with specific providers
-- NULL means match all providers, specific provider_id means match only that provider

-- Add provider_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'streams' AND column_name = 'provider_id'
    ) THEN
        ALTER TABLE streams ADD COLUMN provider_id BIGINT REFERENCES cdn_providers(id) ON DELETE SET NULL;

        -- Create index for provider_id
        CREATE INDEX IF NOT EXISTS idx_streams_provider_id ON streams(provider_id);
    END IF;
END $$;

