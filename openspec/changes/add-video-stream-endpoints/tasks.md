## 1. 数据库设计（PostgreSQL）
- [ ] 1.1 创建 domains 表迁移脚本（up migration）
- [ ] 1.2 创建 domains 表回滚脚本（down migration）
- [ ] 1.3 创建 streams 表迁移脚本（up migration）
- [ ] 1.4 创建 streams 表回滚脚本（down migration）
- [ ] 1.5 创建 stream_paths 表迁移脚本（up migration）
- [ ] 1.6 创建 stream_paths 表回滚脚本（down migration）
- [ ] 1.7 创建 video_stream_endpoints 表迁移脚本（up migration）
- [ ] 1.8 创建 video_stream_endpoints 表回滚脚本（down migration）
- [ ] 1.9 创建必要的索引和外键约束
- [ ] 1.10 在 Docker 环境中运行迁移验证表结构

## 2. 后端实现（Golang + PostgreSQL）
- [ ] 2.1 创建数据模型（Model/Entity）
  - [ ] 2.1.1 Domain 模型
  - [ ] 2.1.2 Stream 模型
  - [ ] 2.1.3 StreamPath 模型
  - [ ] 2.1.4 VideoStreamEndpoint 模型
- [ ] 2.2 实现 Repository 层（数据访问）
  - [ ] 2.2.1 DomainRepository
  - [ ] 2.2.2 StreamRepository
  - [ ] 2.2.3 StreamPathRepository
  - [ ] 2.2.4 VideoStreamEndpointRepository
- [ ] 2.3 实现 Service 层（业务逻辑）
  - [ ] 2.3.1 DomainService（包含验证逻辑）
  - [ ] 2.3.2 StreamService
  - [ ] 2.3.3 StreamPathService
  - [ ] 2.3.4 VideoStreamEndpointService（包含 URL 生成逻辑）
  - [ ] 2.3.5 BatchGenerationService（批量生成端点）
- [ ] 2.4 实现 Handler 层（API 端点）
  - [ ] 2.4.1 DomainHandler（CRUD）
  - [ ] 2.4.2 StreamHandler（CRUD）
  - [ ] 2.4.3 StreamPathHandler（CRUD）
  - [ ] 2.4.4 VideoStreamEndpointHandler（CRUD + 状态切换）
  - [ ] 2.4.5 BatchGenerationHandler（批量生成）
- [ ] 2.5 配置路由（Gin）
  - [ ] 2.5.1 域名管理路由
  - [ ] 2.5.2 流管理路由
  - [ ] 2.5.3 流路径管理路由
  - [ ] 2.5.4 端点管理路由
  - [ ] 2.5.5 批量生成路由
- [ ] 2.6 实现输入验证和错误处理
- [ ] 2.7 实现 URL 生成工具函数
- [ ] 2.8 编写单元测试和集成测试

## 3. 前端实现（React + TypeScript + Ant Design）
- [ ] 3.1 创建 API 客户端方法
  - [ ] 3.1.1 Domain API
  - [ ] 3.1.2 Stream API
  - [ ] 3.1.3 StreamPath API
  - [ ] 3.1.4 VideoStreamEndpoint API
  - [ ] 3.1.5 BatchGeneration API
- [ ] 3.2 创建页面组件
  - [ ] 3.2.1 DomainsPage（列表、创建、编辑、删除）
  - [ ] 3.2.2 StreamsPage（列表、创建、编辑、删除）
  - [ ] 3.2.3 StreamPathsPage（列表、创建、编辑、删除、过滤）
  - [ ] 3.2.4 VideoStreamEndpointsPage（列表、创建、编辑、删除、状态切换、搜索、过滤）
- [ ] 3.3 创建表单组件
  - [ ] 3.3.1 DomainForm
  - [ ] 3.3.2 StreamForm
  - [ ] 3.3.3 StreamPathForm
  - [ ] 3.3.4 VideoStreamEndpointForm
- [ ] 3.4 创建批量生成组件
  - [ ] 3.4.1 BatchGenerationForm（选择器、预览）
  - [ ] 3.4.2 BatchGenerationPreview（显示将生成的端点列表）
- [ ] 3.5 更新导航菜单
- [ ] 3.6 添加错误处理和加载状态
- [ ] 3.7 实现搜索和过滤功能
- [ ] 3.8 实现详情查看功能
- [ ] 3.9 实现数据导出功能

## 4. 集成和测试
- [ ] 4.1 前后端联调
- [ ] 4.2 端到端测试
- [ ] 4.3 性能测试（批量生成大量端点）
- [ ] 4.4 文档更新

