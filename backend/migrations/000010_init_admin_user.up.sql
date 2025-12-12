-- Copyright (c) 2025 kk
--
-- This software is released under the MIT License.
-- https://opensource.org/licenses/MIT

-- 初始化管理员账号
-- 密码通过环境变量 ADMIN_PASSWORD 设置，如果没有设置则使用默认密码 'admin123'
-- 密码使用 bcrypt 加密，cost factor 为 10

DO $$
DECLARE
    admin_username VARCHAR(255) := COALESCE(current_setting('app.admin_username', true), 'admin');
    admin_password VARCHAR(255) := COALESCE(current_setting('app.admin_password', true), 'admin123');
    password_hash VARCHAR(255);
BEGIN
    -- 检查是否已存在管理员账号
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = admin_username) THEN
        -- 使用 bcrypt 加密密码（这里会在 Go 代码中处理，SQL 中只做占位）
        -- 实际的密码哈希会在应用启动时通过 Go 代码生成并插入
        -- 这个迁移文件主要用于创建表结构，实际数据插入在应用代码中完成
        NULL;
    END IF;
END $$;

