# 日志系统使用指南

## 概述

本项目使用 Go 1.21+ 内置的 `slog` 包实现结构化日志记录。日志系统支持多种日志级别和格式，可以通过环境变量进行配置。

## 日志级别

支持的日志级别（从低到高）：

- **DEBUG**: 详细的调试信息，通常只在开发时使用
- **INFO**: 一般信息，记录程序正常运行的关键事件
- **WARN**: 警告信息，表示可能的问题，但不影响程序运行
- **ERROR**: 错误信息，表示发生了错误，需要关注

## 配置

### 环境变量

通过以下环境变量配置日志系统：

- `LOG_LEVEL`: 日志级别，可选值：`DEBUG`, `INFO`, `WARN`, `ERROR`（默认：`INFO`）
- `LOG_FORMAT`: 日志格式，可选值：`text`, `json`（默认：`text`）

### Docker Compose 配置

在 `docker-compose.yml` 中配置：

```yaml
environment:
  LOG_LEVEL: INFO
  LOG_FORMAT: text
```

## 使用方式

### 在代码中使用日志

```go
import "github.com/video-manager/backend/pkg/logger"

// 基本日志
logger.Debug("Debug message", "key", "value")
logger.Info("Info message", "key", "value")
logger.Warn("Warning message", "key", "value")
logger.Error("Error message", "error", err)

// 带上下文的日志
logger.DebugContext(ctx, "Debug message", "key", "value")
logger.InfoContext(ctx, "Info message", "key", "value")
logger.WarnContext(ctx, "Warning message", "key", "value")
logger.ErrorContext(ctx, "Error message", "error", err)

// 创建带属性的 logger
log := logger.With("user_id", userID, "username", username)
log.Info("User action")
```

### 日志格式示例

#### Text 格式（默认）

```
time=2025-12-13T03:45:00Z level=INFO msg="User logged in successfully" username=admin user_id=1 ip=192.168.1.1
```

#### JSON 格式

```json
{
  "time": "2025-12-13T03:45:00Z",
  "level": "INFO",
  "msg": "User logged in successfully",
  "username": "admin",
  "user_id": 1,
  "ip": "192.168.1.1"
}
```

## HTTP 请求日志

系统自动记录所有 HTTP 请求，包括：

- 请求方法、路径、状态码
- 响应时间（延迟）
- 客户端 IP 和 User-Agent
- 用户信息（如果已认证）
- 错误信息（如果有）

### 日志级别分配

- **ERROR**: HTTP 状态码 >= 500
- **WARN**: HTTP 状态码 >= 400
- **INFO**: HTTP 状态码 < 400

## 最佳实践

1. **使用适当的日志级别**
   - DEBUG: 详细的调试信息
   - INFO: 重要的业务事件（登录、创建、删除等）
   - WARN: 潜在问题（认证失败、验证错误等）
   - ERROR: 系统错误（数据库连接失败、服务异常等）

2. **添加有意义的上下文**
   ```go
   // 好的做法
   logger.Info("User created", "user_id", userID, "username", username)

   // 不好的做法
   logger.Info("User created")
   ```

3. **不要在日志中记录敏感信息**
   - 不要记录密码、令牌等敏感信息
   - 可以记录用户 ID、用户名等非敏感信息

4. **使用结构化日志**
   - 使用键值对而不是字符串拼接
   - 便于日志分析和搜索

## 生产环境建议

在生产环境中：

1. 设置 `LOG_LEVEL=INFO` 或 `LOG_LEVEL=WARN`
2. 使用 `LOG_FORMAT=json` 格式，便于日志收集和分析
3. 配置日志轮转和归档
4. 集成日志收集系统（如 ELK、Loki 等）

## 示例

### 开发环境

```bash
LOG_LEVEL=DEBUG LOG_FORMAT=text go run cmd/main.go
```

### 生产环境

```bash
LOG_LEVEL=INFO LOG_FORMAT=json go run cmd/main.go
```

