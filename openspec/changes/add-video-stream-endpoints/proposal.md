# Change: Add Video Stream Endpoints Management

## Why
视频管理系统需要支持视频流域名地址管理功能，能够根据 CDN 线路、备案域名、视频流主类和流路径自动组合生成完整的视频访问地址。这是视频流管理的核心功能，为用户提供统一的视频流端点配置和管理能力。

## What Changes
- 新增域名管理功能（domains 表）
- 新增视频流主类管理功能（streams 表）
- 新增视频流路径管理功能（stream_paths 表）
- 新增视频流端点管理功能（video_stream_endpoints 表）
- 实现 URL 自动生成规则：`https://{line_display_name}.{domain}/{stream_path}.flv`
- 实现后端 RESTful API（Golang）
- 实现前端管理界面（React + Ant Design）
- 支持批量生成视频流端点
- 支持端点状态管理（启用/禁用）

## Impact
- **新增能力**: 视频流端点管理（video-stream-endpoints）
- **受影响代码**:
  - 后端：新增 API handlers, services, repositories
  - 前端：新增管理页面和组件
  - 数据库：新增表结构（domains, streams, stream_paths, video_stream_endpoints）
- **依赖关系**:
  - 依赖现有的 cdn_providers 和 cdn_lines 表
  - 为后续的视频流播放功能提供基础数据

