-- Copyright (c) 2025 kk
--
-- This software is released under the MIT License.
-- https://opensource.org/licenses/MIT

DROP INDEX IF EXISTS idx_tokens_expires_at;
DROP INDEX IF EXISTS idx_tokens_token_hash;
DROP INDEX IF EXISTS idx_tokens_user_id;
DROP TABLE IF EXISTS tokens;

