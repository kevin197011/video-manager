# Video Manager

视频管理系统 - CDN 线路管理模块

## 项目结构

```
video-manager/
├── backend/          # Golang 后端服务
│   ├── cmd/         # 应用入口
│   ├── internal/    # 内部代码（handlers, services, repositories, models）
│   ├── migrations/  # 数据库迁移脚本
│   └── pkg/         # 可复用的包
├── frontend/        # React + TypeScript 前端应用
│   └── src/         # 源代码
├── docker-compose.yml  # Docker Compose 配置
└── .env.example        # 环境变量模板
```

## 技术栈

- **后端**: Golang + Gin + PostgreSQL (pgx)
- **前端**: React + TypeScript + Vite + Tailwind CSS
- **数据库**: PostgreSQL 16
- **开发环境**: Docker Compose

## 快速开始

### 1. 环境准备

确保已安装：
- Docker 和 Docker Compose
- Go 1.23+ (如果本地开发)
- Node.js 20+ 和 npm (如果本地开发)
- Make (可选，用于便捷命令)

### 2. 配置环境变量

复制环境变量模板：
```bash
cp .env.example .env
```

根据需要修改 `.env` 文件中的配置。

### 3. 启动开发环境

#### 方式一：使用 Docker Compose（推荐，完整环境）

启动所有服务（数据库 + 后端 + 前端）：
```bash
docker-compose up
```

或者使用 Make 命令：
```bash
make up          # 后台启动
make up-logs     # 前台启动并显示日志
```

或者后台运行：
```bash
docker-compose up -d
```

查看日志：
```bash
make logs              # 所有服务日志
make logs-backend      # 后端日志
make logs-frontend     # 前端日志
make logs-db          # 数据库日志
```

停止服务：
```bash
make down
# 或
docker-compose down
```

#### 方式二：只启动数据库（本地运行前后端）

只启动 PostgreSQL：
```bash
docker-compose up postgres -d
```

然后本地运行后端和前端（见下方说明）。

### 4. 运行数据库迁移

如果使用 Docker Compose 运行后端，迁移会在容器内运行。否则，本地运行迁移：

```bash
cd backend
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
migrate -path migrations -database "postgres://videomanager:videomanager@localhost:5432/videomanager?sslmode=disable" up
```

### 5. 本地开发（如果未使用 Docker Compose 运行服务）

#### 启动后端服务

```bash
cd backend
go mod download
go run cmd/main.go
```

后端服务将在 `http://localhost:8080` 启动。

#### 启动前端应用

```bash
cd frontend
npm install
npm run dev
```

前端应用将在 `http://localhost:5173` 启动。

## API 端点

### CDN Providers

- `GET /api/cdn-providers` - 获取所有提供商
- `GET /api/cdn-providers/:id` - 获取指定提供商
- `POST /api/cdn-providers` - 创建提供商
- `PUT /api/cdn-providers/:id` - 更新提供商
- `DELETE /api/cdn-providers/:id` - 删除提供商
- `GET /api/cdn-providers/:id/lines` - 获取提供商下的线路

### CDN Lines

- `GET /api/cdn-lines` - 获取所有线路（支持 `?provider_id=` 过滤）
- `GET /api/cdn-lines/:id` - 获取指定线路
- `POST /api/cdn-lines` - 创建线路
- `PUT /api/cdn-lines/:id` - 更新线路
- `DELETE /api/cdn-lines/:id` - 删除线路

## 开发

### Docker Compose 开发模式

使用 Docker Compose 时，支持热重载：

- **后端**: 使用 Air 自动重载，修改代码后自动重启
- **前端**: 使用 Vite HMR，修改代码后自动刷新
- **数据库**: 数据持久化在 `postgres_data` 卷中

### 本地开发

#### 后端开发

```bash
cd backend
go run cmd/main.go
```

或者使用 Air 实现热重载：
```bash
cd backend
go install github.com/cosmtrek/air@latest
air
```

#### 前端开发

```bash
cd frontend
npm run dev
```

### 调试技巧

#### 使用 Makefile（推荐）

查看所有可用命令：
```bash
make help
```

常用命令：
```bash
make up              # 启动所有服务
make down            # 停止所有服务
make logs            # 查看所有日志
make logs-backend    # 查看后端日志
make logs-frontend   # 查看前端日志
make db-only         # 只启动数据库
make shell-backend   # 进入后端容器
make shell-frontend  # 进入前端容器
make shell-db        # 进入数据库
make restart         # 重启所有服务
make clean           # 清理所有容器和卷（危险）
```

#### 直接使用 Docker Compose

1. **只运行数据库**：
   ```bash
   docker-compose up postgres -d
   # 或
   make db-only
   ```

2. **只运行特定服务**：
   ```bash
   docker-compose up postgres backend
   ```

3. **查看服务日志**：
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

4. **进入容器调试**：
   ```bash
   docker-compose exec backend sh
   docker-compose exec frontend sh
   # 或
   make shell-backend
   make shell-frontend
   ```

5. **重建服务**：
   ```bash
   docker-compose build backend
   docker-compose up backend
   # 或
   make build
   ```

### 数据库迁移

创建新迁移：
```bash
migrate create -ext sql -dir migrations -seq migration_name
```

运行迁移：
```bash
migrate -path migrations -database "postgres://videomanager:videomanager@localhost:5432/videomanager?sslmode=disable" up
```

回滚迁移：
```bash
migrate -path migrations -database "postgres://videomanager:videomanager@localhost:5432/videomanager?sslmode=disable" down
```

## 许可证

MIT License

Copyright (c) 2025 kk

