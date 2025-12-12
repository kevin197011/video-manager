# Project Context

## Purpose
视频管理系统（Video Manager）是一个用于管理视频流端点、CDN 线路、域名和流配置的综合平台。系统支持多 CDN 提供商、多线路配置，并提供完整的视频流端点管理功能。系统支持自动生成视频流端点 URL，提供用户认证、Token 管理、统计仪表板，以及 FLV 视频流播放功能。

## Tech Stack

### 后端技术栈
- **语言**: Go 1.24.0
- **Web 框架**: Gin v1.9.1
- **数据库**: PostgreSQL 16-alpine
- **数据库驱动**: pgx/v5 v5.5.1
- **认证**: JWT (golang-jwt/jwt/v5 v5.3.0)
- **密码加密**: bcrypt (golang.org/x/crypto)
- **API 文档**: Swagger (swaggo/swag v1.16.6, swaggo/gin-swagger v1.6.1)
- **日志**: 结构化日志 (log/slog)
- **配置管理**: godotenv v1.5.1
- **开发工具**: Air (热重载)

### 前端技术栈
- **框架**: React 19.2.0
- **语言**: TypeScript 5.9.3
- **UI 组件库**: Ant Design 6.1.0
- **构建工具**: Vite 7.2.4
- **路由**: React Router DOM 7.10.1
- **HTTP 客户端**: Axios 1.13.2
- **视频播放**: flv.js 1.6.2
- **样式**: Tailwind CSS 4.1.18
- **代码质量**: ESLint 9.39.1, TypeScript ESLint 8.46.4

### 开发环境
- **容器化**: Docker Compose
- **数据库**: PostgreSQL 16-alpine
- **热重载**: Air (后端), Vite HMR (前端)
- **网络**: Docker bridge network

## Project Conventions

### Code Style
- **Go**: 遵循 Go 官方代码规范，使用 `gofmt` 格式化
- **TypeScript/React**: 使用 ESLint + TypeScript，遵循 React Hooks 最佳实践
- **命名规范**:
  - Go: 驼峰命名（camelCase）和帕斯卡命名（PascalCase）
  - TypeScript: 驼峰命名（camelCase）和帕斯卡命名（PascalCase）
- **文件头**: 所有新文件必须包含 MIT 许可证头（Copyright (c) 2025 kk）

### Architecture Patterns
- **后端**: 采用分层架构（Handler -> Service -> Repository）
  - `handlers/`: HTTP 请求处理层
  - `services/`: 业务逻辑层
  - `repositories/`: 数据访问层
  - `models/`: 数据模型
  - `pkg/`: 可复用的包（database, jwt, logger, middleware, response, url_generator）
- **前端**: 组件化开发，使用 Ant Design 作为 UI 组件库
  - `pages/`: 页面组件
  - `components/`: 可复用组件
  - `lib/`: 工具库（api, auth）
- **API**: RESTful 设计，统一的错误处理和响应格式
- **认证**: JWT Token 认证，支持 Bearer Token 和直接 Token 格式

### Testing Strategy
- **后端**: 单元测试 + 集成测试，使用 Go 标准 testing 包
- **前端**: 组件测试 + E2E 测试（待完善）
- **核心业务逻辑覆盖率**: ≥ 80%

### Git Workflow
- 遵循 Conventional Commits 规范
- 主分支保持稳定，通过 Pull Request 合并代码
- 使用有意义的分支名称

### 日志规范
- 使用结构化日志（slog）
- 日志级别：DEBUG, INFO, WARN, ERROR
- 日志格式：支持 text 和 JSON 格式
- 通过环境变量 `LOG_LEVEL` 和 `LOG_FORMAT` 配置

## Domain Context

### 核心概念
- **CDN 提供商（CDN Provider）**: 提供 CDN 服务的厂商（如阿里云、腾讯云、火山引擎等）
- **CDN 线路（CDN Line）**: 属于某个 CDN 提供商的线路，包含名称（name）和显示名称（display_name）
- **域名（Domain）**: CDN 使用的备案域名
- **视频流区域（Stream Region）**: 视频流配置，包含区域名称和代码（如 kkw, eu2, eu3）
- **流路径（Stream Path）**: 流的路径配置，包含桌台号（table_id）和完整路径（full_path）
- **视频流端点（Video Stream Endpoint）**: 完整的视频流端点配置，自动根据提供商、线路、域名、流区域和流路径组合生成，包含完整 URL 和状态（启用/禁用）

### 数据模型关系
- CDN 提供商 1:N CDN 线路
- 视频流区域 1:N 流路径
- 视频流端点关联：提供商、线路、域名、流区域、流路径（多对多关系）
- 用户 1:N Token（JWT Token 管理）

### URL 生成规则
视频流端点 URL 格式：`https://{line_display_name}.{domain}/{stream_path_full_path}.flv`

### 自动生成机制
- 视频流端点在以下操作后自动重新生成：
  - CDN 提供商的新增、更新、删除
  - CDN 线路的新增、更新、删除
  - 域名的新增、更新、删除
  - 视频流区域的新增、更新、删除
  - 流路径的新增、更新、删除
- 生成过程：先删除所有现有端点，然后根据当前配置重新生成

## Important Constraints
- 所有新文件必须包含 MIT 许可证头（Copyright (c) 2025 kk）
- 优先使用较新的稳定兼容版本的 SDK 和依赖
- 敏感信息使用环境变量管理，不硬编码
- 数据库迁移使用 SQL 文件，支持 `.sql` 文件用于测试数据初始化
- 删除操作不受视频流端点影响，删除父实体时会自动清理关联的端点并重新生成

## External Dependencies

### 后端依赖
- **Gin**: Web 框架
- **pgx/v5**: PostgreSQL 驱动
- **golang-jwt/jwt/v5**: JWT 认证
- **swaggo/swag**: Swagger 文档生成
- **swaggo/gin-swagger**: Swagger UI 集成
- **godotenv**: 环境变量管理
- **log/slog**: 结构化日志（Go 标准库）

### 前端依赖
- **React**: UI 框架
- **Ant Design**: UI 组件库
- **React Router DOM**: 路由管理
- **Axios**: HTTP 客户端
- **flv.js**: FLV 视频流播放
- **Vite**: 构建工具和开发服务器
- **Tailwind CSS**: 样式框架

### 开发工具
- **Docker Compose**: 容器编排
- **Air**: Go 热重载工具
- **Swagger**: API 文档生成和展示

## 主要功能模块

### 1. CDN 管理
- CDN 提供商管理（CRUD）
- CDN 线路管理（CRUD，支持按提供商过滤）

### 2. 域名管理
- 域名管理（CRUD）

### 3. 视频流区域管理
- 视频流区域管理（CRUD）
- 支持区域代码（code）和名称（name）

### 4. 流路径管理
- 流路径管理（CRUD）
- 支持桌台号（table_id）和完整路径（full_path）
- 关联视频流区域

### 5. 视频流端点管理
- 自动生成视频流端点
- 端点列表查看（支持多维度过滤：提供商、线路、域名、流区域、桌台号、状态）
- 端点状态管理（启用/禁用）
- FLV 视频流播放功能
- 批量删除功能

### 6. 用户认证与授权
- 用户登录（JWT Token）
- 密码修改
- Token 管理（创建、查看、删除）
- Token 过期时间配置（支持永不过期或指定时长）
- 受保护的路由

### 7. 统计仪表板
- 系统统计概览（提供商、线路、域名、流区域、流路径、端点总数）
- 按厂商统计线路
- 按视频流区域统计端点
- 自动刷新功能

### 8. API 文档
- Swagger UI 集成
- 完整的 API 文档
- Token 认证支持
- 前端代理访问

## 环境变量配置

### 后端环境变量
- `POSTGRES_USER`: PostgreSQL 用户名（默认：videomanager）
- `POSTGRES_PASSWORD`: PostgreSQL 密码（默认：videomanager）
- `POSTGRES_DB`: PostgreSQL 数据库名（默认：videomanager）
- `POSTGRES_HOST`: PostgreSQL 主机（默认：postgres）
- `POSTGRES_PORT`: PostgreSQL 端口（默认：5432）
- `API_PORT`: API 服务端口（默认：8080）
- `GIN_MODE`: Gin 运行模式（debug/release，默认：debug）
- `JWT_SECRET`: JWT 密钥（生产环境必须修改）
- `ADMIN_USERNAME`: 管理员用户名（默认：admin）
- `ADMIN_PASSWORD`: 管理员密码（默认：admin123）
- `LOG_LEVEL`: 日志级别（DEBUG/INFO/WARN/ERROR，默认：INFO）
- `LOG_FORMAT`: 日志格式（text/json，默认：text）
- `SWAGGER_HOST`: Swagger 主机（可选，用于 Swagger UI 配置）

### 前端环境变量
- `VITE_API_BASE_URL`: API 基础 URL（默认：http://localhost:8080/api）
- `VITE_API_BASE_URL_INTERNAL`: 容器内 API URL（用于代理）

## 数据库迁移
- 使用 SQL 迁移文件（`migrations/` 目录）
- 支持 `.up.sql` 和 `.down.sql` 文件
- 支持 `.sql` 文件用于测试数据初始化
- 迁移在应用启动时自动执行
