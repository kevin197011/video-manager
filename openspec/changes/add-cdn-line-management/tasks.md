## 1. 开发环境配置（Docker Compose）
- [ ] 1.1 创建 docker-compose.yml 文件
- [ ] 1.2 配置 PostgreSQL 服务（端口、数据卷、环境变量）
- [ ] 1.3 创建 .env.example 文件（环境变量模板）
- [ ] 1.4 创建 .dockerignore 文件
- [ ] 1.5 测试 Docker Compose 启动和停止
- [ ] 1.6 验证数据库连接

## 2. 数据库设计（PostgreSQL）
- [ ] 2.1 设置 golang-migrate 迁移工具
- [ ] 2.2 创建 cdn_providers 表迁移脚本（up migration）
- [ ] 2.3 创建 cdn_providers 表回滚脚本（down migration）
- [ ] 2.4 创建 cdn_lines 表迁移脚本（up migration）
- [ ] 2.5 创建 cdn_lines 表回滚脚本（down migration）
- [ ] 2.6 在 Docker 环境中运行迁移验证表结构、外键约束和索引

## 3. 后端实现（Golang + PostgreSQL）
- [ ] 3.1 创建 backend 目录结构（cmd/, internal/, migrations/, pkg/）
- [ ] 3.2 初始化 Go 模块（go.mod）
- [ ] 3.3 配置 PostgreSQL 连接（使用 pgx driver）
- [ ] 3.4 创建数据模型（Model/Entity）
- [ ] 3.5 实现 Repository 层（数据访问，使用 pgx）
- [ ] 3.6 实现 Service 层（业务逻辑）
- [ ] 3.7 实现 Handler 层（API 端点）
- [ ] 3.8 配置路由（Gin 或 Echo）
- [ ] 3.9 实现输入验证和错误处理
- [ ] 3.10 实现统一响应格式
- [ ] 3.11 编写单元测试和集成测试

## 4. 前端实现
- [ ] 4.1 创建 frontend 目录结构
- [ ] 4.2 初始化 React + TypeScript + Vite 项目
- [ ] 4.3 设置 shadcn/ui 组件库
- [ ] 4.4 配置路由（React Router）
- [ ] 4.5 创建 CDN 提供商管理页面
- [ ] 4.6 创建 CDN 线路管理页面
- [ ] 4.7 实现 API 客户端（axios 或 fetch）
- [ ] 4.8 实现表单组件（创建/编辑）
- [ ] 4.9 实现列表展示组件
- [ ] 4.10 实现删除确认对话框
- [ ] 4.11 添加错误处理和加载状态

## 5. 集成和测试
- [ ] 5.1 前后端联调
- [ ] 5.2 端到端测试
- [ ] 5.3 性能测试
- [ ] 5.4 文档更新

