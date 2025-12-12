-- Copyright (c) 2025 kk
--
-- This software is released under the MIT License.
-- https://opensource.org/licenses/MIT

-- 删除管理员账号（可选，根据需求决定是否保留）
-- DELETE FROM users WHERE username = COALESCE(current_setting('app.admin_username', true), 'admin');

