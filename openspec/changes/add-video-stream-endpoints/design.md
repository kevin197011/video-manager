# Design: Video Stream Endpoints Management

## Context
视频管理系统需要支持视频流域名地址管理功能，能够根据 CDN 线路、备案域名、视频流主类和流路径自动组合生成完整的视频访问地址。这是视频流管理的核心功能，为用户提供统一的视频流端点配置和管理能力。

## Project Structure
```
video-manager/
├── backend/
│   ├── migrations/
│   │   ├── 000003_create_domains.up.sql
│   │   ├── 000003_create_domains.down.sql
│   │   ├── 000004_create_streams.up.sql
│   │   ├── 000004_create_streams.down.sql
│   │   ├── 000005_create_stream_paths.up.sql
│   │   ├── 000005_create_stream_paths.down.sql
│   │   ├── 000006_create_video_stream_endpoints.up.sql
│   │   └── 000006_create_video_stream_endpoints.down.sql
│   ├── internal/
│   │   ├── models/
│   │   │   ├── domain.go
│   │   │   ├── stream.go
│   │   │   ├── stream_path.go
│   │   │   └── video_stream_endpoint.go
│   │   ├── repositories/
│   │   │   ├── domain_repository.go
│   │   │   ├── stream_repository.go
│   │   │   ├── stream_path_repository.go
│   │   │   └── video_stream_endpoint_repository.go
│   │   ├── services/
│   │   │   ├── domain_service.go
│   │   │   ├── stream_service.go
│   │   │   ├── stream_path_service.go
│   │   │   ├── video_stream_endpoint_service.go
│   │   │   └── batch_generation_service.go
│   │   └── handlers/
│   │       ├── domain_handler.go
│   │       ├── stream_handler.go
│   │       ├── stream_path_handler.go
│   │       ├── video_stream_endpoint_handler.go
│   │       └── batch_generation_handler.go
│   └── pkg/
│       └── url_generator.go
└── frontend/
    └── src/
        ├── pages/
        │   ├── DomainsPage.tsx
        │   ├── StreamsPage.tsx
        │   ├── StreamPathsPage.tsx
        │   └── VideoStreamEndpointsPage.tsx
        └── components/
            ├── DomainForm.tsx
            ├── StreamForm.tsx
            ├── StreamPathForm.tsx
            ├── VideoStreamEndpointForm.tsx
            └── BatchGenerationForm.tsx
```

## Goals / Non-Goals

### Goals
- 提供完整的域名、流、流路径和视频流端点 CRUD 操作
- 实现自动 URL 生成功能
- 支持批量生成视频流端点
- 提供友好的用户界面
- 确保数据一致性和完整性

### Non-Goals
- 视频流播放功能（后续实现）
- 复杂的权限控制（初期简化）
- 实时 URL 验证（初期简化）
- URL 缓存机制（初期简化）

## Decisions

### Decision: 数据库设计
- **选择**: 使用四个独立表（domains, streams, stream_paths, video_stream_endpoints）
- **理由**:
  - 清晰的实体关系
  - 便于独立管理各个实体
  - 支持灵活的查询和过滤
- **表结构**:
  - `domains`: id, name, created_at, updated_at
  - `streams`: id, name, code, created_at, updated_at
  - `stream_paths`: id, stream_id (FK), name, full_path, created_at, updated_at
  - `video_stream_endpoints`: id, provider_id (FK), line_id (FK), domain_id (FK), stream_id (FK), stream_path_id (FK), full_url, status, created_at, updated_at
- **替代方案**: 使用 JSON 字段存储关联信息
  - 未选择原因：不利于查询和索引，数据一致性难以保证

### Decision: URL 生成策略
- **选择**: 在创建/更新时自动生成并存储 full_url
- **理由**:
  - 查询性能更好（无需实时计算）
  - 数据一致性（URL 与组件数据同步）
  - 便于搜索和过滤
- **生成规则**: `https://{line_display_name}.{domain}/{stream_path}.flv`
- **替代方案**: 实时计算 URL
  - 未选择原因：查询性能较差，难以支持 URL 搜索

### Decision: 批量生成策略
- **选择**: 提供独立的批量生成 API 和 UI
- **理由**:
  - 用户体验更好（可以预览和确认）
  - 避免意外生成大量数据
  - 支持选择性生成
- **实现方式**:
  - 前端提供选择器（多选线路、域名、流、路径）
  - 后端生成所有组合的预览
  - 用户确认后批量创建
- **替代方案**: 自动生成所有可能的组合
  - 未选择原因：可能生成大量不需要的数据

### Decision: 状态管理
- **选择**: 使用简单的 status 字段（0=禁用, 1=启用）
- **理由**:
  - 简单直接
  - 满足当前需求
- **替代方案**: 使用枚举类型或状态机
  - 未选择原因：当前需求简单，无需复杂状态管理

## Database Schema

### domains 表
```sql
CREATE TABLE domains (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_domains_name ON domains(name);
```

### streams 表
```sql
CREATE TABLE streams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_streams_code ON streams(code);
```

### stream_paths 表
```sql
CREATE TABLE stream_paths (
    id BIGSERIAL PRIMARY KEY,
    stream_id BIGINT NOT NULL REFERENCES streams(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    full_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_stream_paths_stream_id ON stream_paths(stream_id);
CREATE INDEX idx_stream_paths_full_path ON stream_paths(full_path);
```

### video_stream_endpoints 表
```sql
CREATE TABLE video_stream_endpoints (
    id BIGSERIAL PRIMARY KEY,
    provider_id BIGINT NOT NULL REFERENCES cdn_providers(id) ON DELETE RESTRICT,
    line_id BIGINT NOT NULL REFERENCES cdn_lines(id) ON DELETE RESTRICT,
    domain_id BIGINT NOT NULL REFERENCES domains(id) ON DELETE RESTRICT,
    stream_id BIGINT NOT NULL REFERENCES streams(id) ON DELETE RESTRICT,
    stream_path_id BIGINT NOT NULL REFERENCES stream_paths(id) ON DELETE RESTRICT,
    full_url VARCHAR(1000) NOT NULL,
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(line_id, domain_id, stream_path_id)
);

CREATE INDEX idx_video_stream_endpoints_line_id ON video_stream_endpoints(line_id);
CREATE INDEX idx_video_stream_endpoints_domain_id ON video_stream_endpoints(domain_id);
CREATE INDEX idx_video_stream_endpoints_stream_id ON video_stream_endpoints(stream_id);
CREATE INDEX idx_video_stream_endpoints_status ON video_stream_endpoints(status);
CREATE INDEX idx_video_stream_endpoints_full_url ON video_stream_endpoints(full_url);
```

## API Design

### Domain API
- `GET /api/domains` - 获取所有域名
- `GET /api/domains/:id` - 获取域名详情
- `POST /api/domains` - 创建域名
- `PUT /api/domains/:id` - 更新域名
- `DELETE /api/domains/:id` - 删除域名

### Stream API
- `GET /api/streams` - 获取所有流
- `GET /api/streams/:id` - 获取流详情
- `POST /api/streams` - 创建流
- `PUT /api/streams/:id` - 更新流
- `DELETE /api/streams/:id` - 删除流

### Stream Path API
- `GET /api/stream-paths` - 获取所有流路径（支持 stream_id 过滤）
- `GET /api/stream-paths/:id` - 获取流路径详情
- `POST /api/stream-paths` - 创建流路径
- `PUT /api/stream-paths/:id` - 更新流路径
- `DELETE /api/stream-paths/:id` - 删除流路径

### Video Stream Endpoint API
- `GET /api/video-stream-endpoints` - 获取所有端点（支持多维度过滤）
- `GET /api/video-stream-endpoints/:id` - 获取端点详情
- `POST /api/video-stream-endpoints` - 创建端点
- `PUT /api/video-stream-endpoints/:id` - 更新端点
- `DELETE /api/video-stream-endpoints/:id` - 删除端点
- `PATCH /api/video-stream-endpoints/:id/status` - 切换端点状态

### Batch Generation API
- `POST /api/video-stream-endpoints/batch/preview` - 预览批量生成的端点
- `POST /api/video-stream-endpoints/batch/generate` - 执行批量生成

## URL Generation Logic

```go
func GenerateEndpointURL(lineDisplayName, domain, streamPath string) string {
    return fmt.Sprintf("https://%s.%s/%s.flv", lineDisplayName, domain, streamPath)
}
```

## Risks / Trade-offs

### Risk: 批量生成性能
- **风险**: 生成大量端点时可能影响性能
- **缓解**:
  - 使用事务批量插入
  - 限制单次生成数量
  - 提供异步生成选项（后续优化）

### Risk: URL 一致性
- **风险**: 如果组件数据更新，已生成的 URL 可能不一致
- **缓解**:
  - 更新组件时自动更新相关端点 URL
  - 提供 URL 重新生成功能

### Risk: 数据冗余
- **风险**: full_url 字段存储了可计算的数据
- **权衡**:
  - 优点：查询性能好，支持 URL 搜索
  - 缺点：需要维护一致性
- **决策**: 接受冗余，通过自动生成保证一致性

## Migration Plan

1. 创建数据库迁移脚本
2. 实现后端模型和 Repository 层
3. 实现 Service 层（包含 URL 生成逻辑）
4. 实现 Handler 层和路由
5. 实现前端 API 客户端
6. 实现前端页面和组件
7. 集成测试
8. 部署和验证

## Open Questions

- [ ] 是否需要支持自定义 URL 后缀（不仅仅是 .flv）？
- [ ] 是否需要支持 URL 模板配置？
- [ ] 批量生成时是否需要去重检查？
- [ ] 是否需要支持端点使用统计？

