# Design: CDN Line Management

## Context
视频管理系统需要管理 CDN 提供商和线路配置。这是系统的核心基础功能，为后续的视频流端点管理提供数据支撑。

## Project Structure
```
video-manager/
├── backend/          # Golang 后端服务
│   ├── cmd/         # 应用入口
│   ├── internal/    # 内部代码（handlers, services, repositories）
│   ├── migrations/  # 数据库迁移脚本
│   ├── pkg/         # 可复用的包
│   └── go.mod       # Go 模块定义
├── frontend/        # React + TypeScript 前端应用
│   ├── src/         # 源代码
│   ├── public/      # 静态资源
│   └── package.json # 依赖管理
├── docker-compose.yml  # Docker Compose 配置
└── .env.example        # 环境变量模板
```

## Goals / Non-Goals

### Goals
- 提供完整的 CDN 提供商和线路 CRUD 操作
- 实现清晰的前后端分离架构
- 提供友好的用户界面
- 确保数据一致性和完整性

### Non-Goals
- 视频流端点管理（后续实现）
- 流和流路径管理（后续实现）
- 域名管理（后续实现）
- 复杂的权限控制（初期简化）

## Decisions

### Decision: 后端技术栈
- **选择**: Golang + 标准库 + 轻量级框架（如 Gin 或 Echo）
- **理由**:
  - 高性能和并发能力
  - 简洁的语法和标准库
  - 良好的生态系统
- **数据库连接**: PostgreSQL (pgx driver)
- **替代方案**: Node.js, Python (Django/FastAPI)
  - 未选择原因：Golang 在 API 服务方面性能更优

### Decision: 前端技术栈
- **选择**: React + TypeScript + shadcn/ui + Vite
- **理由**:
  - React 生态成熟
  - TypeScript 提供类型安全
  - shadcn/ui 提供高质量组件
- **替代方案**: Vue, Angular
  - 未选择原因：用户明确要求 shadcn/ui（基于 React）

### Decision: 项目结构
- **选择**: 前后端分离的目录结构
- **结构**:
  - `backend/` - Golang 后端服务
  - `frontend/` - React + TypeScript 前端应用
- **理由**:
  - 清晰的职责分离
  - 便于独立开发和部署
  - 符合微服务架构理念

### Decision: 开发环境
- **选择**: Docker Compose
- **理由**:
  - 统一开发环境，避免本地环境差异
  - 快速启动 PostgreSQL 数据库服务
  - 便于团队协作和 CI/CD 集成
  - 支持服务编排和网络配置
- **服务配置**:
  - PostgreSQL 服务（带初始化脚本）
  - 后端服务（可选，开发时也可本地运行）
  - 前端服务（可选，开发时也可本地运行）
- **目录映射**:
  - `backend/` 映射到后端容器工作目录
  - `frontend/` 映射到前端容器工作目录（如需要）

### Decision: 数据库设计
- **选择**: PostgreSQL
- **理由**:
  - 关系型数据模型清晰
  - 支持外键约束保证数据完整性
  - 成熟稳定
  - 支持 JSON 类型（为后续扩展预留）
- **驱动选择**: `github.com/jackc/pgx/v5` (pgx)
  - 理由：性能优秀，支持连接池，类型安全
- **迁移工具**: `github.com/golang-migrate/migrate/v4`
  - 理由：成熟的数据库迁移工具，支持版本控制
- **表结构**:
  - `cdn_providers`:
    - `id` BIGSERIAL PRIMARY KEY
    - `name` VARCHAR(255) NOT NULL
    - `code` VARCHAR(100) NOT NULL UNIQUE
    - `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    - `updated_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  - `cdn_lines`:
    - `id` BIGSERIAL PRIMARY KEY
    - `provider_id` BIGINT NOT NULL REFERENCES cdn_providers(id) ON DELETE RESTRICT
    - `name` VARCHAR(255) NOT NULL
    - `display_name` VARCHAR(255) NOT NULL
    - `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    - `updated_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  - **索引**:
    - `cdn_providers.code` UNIQUE INDEX
    - `cdn_lines.provider_id` INDEX (用于关联查询)
    - `cdn_lines.name` INDEX (用于搜索)

### Decision: API 设计
- **选择**: RESTful API
- **端点设计**:
  - `GET /api/cdn-providers` - 列表
  - `POST /api/cdn-providers` - 创建
  - `GET /api/cdn-providers/:id` - 详情
  - `PUT /api/cdn-providers/:id` - 更新
  - `DELETE /api/cdn-providers/:id` - 删除
  - `GET /api/cdn-providers/:id/lines` - 获取提供商下的线路
  - `GET /api/cdn-lines` - 列表
  - `POST /api/cdn-lines` - 创建
  - `GET /api/cdn-lines/:id` - 详情
  - `PUT /api/cdn-lines/:id` - 更新
  - `DELETE /api/cdn-lines/:id` - 删除

### Decision: 响应格式
- **统一响应格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {...}
}
```
- **错误响应**:
```json
{
  "code": 400,
  "message": "error message",
  "data": null
}
```

## Risks / Trade-offs

### Risk: 数据一致性
- **风险**: 删除 CDN 提供商时，关联的线路如何处理
- **缓解**: 实现级联删除或软删除，或阻止删除有关联数据的提供商

### Risk: 性能
- **风险**: 列表查询可能涉及多表关联
- **缓解**: 使用索引优化，必要时使用分页

### Risk: 前端状态管理
- **风险**: 状态管理可能变得复杂
- **缓解**: 初期使用 React Hooks + Context，后续如需要再引入状态管理库

## Migration Plan

### 开发环境搭建
1. 创建 `docker-compose.yml` 配置文件
2. 配置 PostgreSQL 服务（端口、数据卷、环境变量）
3. 配置数据库初始化脚本（可选）
4. 配置服务网络和依赖关系
5. 创建 `.env.example` 文件（环境变量模板）

### 数据库迁移
1. 使用 golang-migrate 创建迁移脚本
2. 创建 `cdn_providers` 表（包含唯一索引）
3. 创建 `cdn_lines` 表（包含外键约束和索引）
4. 验证表结构和约束
5. 创建回滚脚本（down migration）

### 部署步骤
1. 使用 `docker-compose up` 启动开发环境
2. 运行数据库迁移
3. 启动后端服务（本地或容器）
4. 启动前端应用（本地或容器）
5. 验证功能

### 回滚计划
- 保留数据库迁移脚本的向下兼容版本
- 使用 `docker-compose down -v` 清理数据（开发环境）
- 前后端版本化部署，支持快速回滚

## Open Questions
- [ ] 是否需要支持批量导入 CDN 提供商和线路？
- [ ] 是否需要审计日志记录操作历史？
- [ ] 是否需要支持软删除？

