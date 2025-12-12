# Change: Add CDN Line Management

## Why
视频管理系统需要支持 CDN 线路管理功能，这是构建完整视频流端点管理的基础。用户需要能够管理 CDN 提供商及其下的线路配置，为后续的视频流端点配置提供数据支撑。

## What Changes
- 新增 CDN 提供商管理功能（创建、查询、更新、删除）
- 新增 CDN 线路管理功能（创建、查询、更新、删除）
- 实现后端 RESTful API（Golang）
- 实现前端管理界面（React + shadcn/ui）
- 创建数据库表结构（cdn_providers, cdn_lines）
- 实现数据模型和业务逻辑层

## Impact
- **新增能力**: CDN 线路管理（cdn-line-management）
- **受影响代码**:
  - 后端：新增 API handlers, services, repositories
  - 前端：新增管理页面和组件
  - 数据库：新增表结构
- **后续扩展**: 为视频流端点管理功能提供基础数据

