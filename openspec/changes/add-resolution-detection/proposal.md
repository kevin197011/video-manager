# Change: Add Resolution Detection for Video Stream Endpoints

## Why
视频流端点管理需要支持分辨率识别功能，以便用户能够快速区分和管理不同码率的视频流。当前系统缺少分辨率信息，无法自动识别和分类视频流的清晰度（普清、高清、超清）。添加此功能将提升用户体验，支持按分辨率筛选和管理视频流端点。

## What Changes
- 在 `video_stream_endpoints` 表中新增 `resolution` 字段（VARCHAR，存储：普清、高清、超清）
- 实现自动分辨率识别逻辑，从流路径（`full_path`）或 URL 中提取分辨率标识
- 实现实际视频流分辨率检测功能，通过访问视频流获取真实分辨率
- 更新数据模型，在创建和更新端点时自动识别并设置分辨率
- 更新 API 响应，包含分辨率字段
- 新增 API 端点：测试播放并识别分辨率（`POST /api/video-stream-endpoints/:id/test-resolution`）
- 更新前端界面，显示分辨率信息并支持按分辨率筛选
- 在前端操作列添加"分辨率检测"按钮，支持点击后自动检测视频流分辨率并更新到数据库
- 为现有数据提供迁移脚本，自动识别并填充分辨率字段

## Impact
- **受影响的能力**: 视频流端点管理（video-stream-endpoints）
- **受影响代码**:
  - 后端：
    - `backend/internal/models/video_stream_endpoint.go` - 添加 Resolution 字段
    - `backend/migrations/init_schema.sql` - 添加 resolution 列
    - `backend/internal/repositories/video_stream_endpoint_repository.go` - 更新创建/更新逻辑
    - `backend/internal/services/video_stream_endpoint_service.go` - 添加分辨率识别服务
    - `backend/pkg/resolution/` - 新增分辨率识别工具包（路径识别 + 流检测，使用 lal 库）
    - `backend/internal/handlers/video_stream_endpoint_handler.go` - 添加测试播放 API
  - 前端：
    - `frontend/src/lib/api.ts` - 更新 TypeScript 类型定义，添加测试播放 API
    - `frontend/src/pages/VideoStreamEndpointsPage.tsx` - 显示分辨率、支持筛选、添加测试播放按钮
- **数据库变更**: 需要添加新列，并为现有数据填充默认值
- **向后兼容**: 新字段可为空或设置默认值，不影响现有功能
- **新增依赖**: `github.com/q191201771/lal` - Go 音视频直播流媒体库（用于实际流检测）

