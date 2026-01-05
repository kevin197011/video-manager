## 1. 数据库迁移
- [ ] 1.1 创建数据库迁移脚本，添加 `resolution VARCHAR(20)` 列到 `video_stream_endpoints` 表
- [ ] 1.2 为现有数据设置默认值 "普清"
- [ ] 1.3 创建索引（如需要按分辨率筛选）
- [ ] 1.4 更新 `init_schema.sql` 包含新字段

## 2. 后端实现 - 分辨率识别工具
- [ ] 2.1 创建 `backend/pkg/resolution/resolution.go` 包
- [ ] 2.2 实现 `DetectResolutionFromPath(fullPath string) string` 函数
  - [ ] 2.2.1 识别 "SD" 或 "sd" → "普清"
  - [ ] 2.2.2 识别 "HD" 或 "hd" → "高清"
  - [ ] 2.2.3 识别 "UHD"、"uhd"、"4K" 或 "4k" → "超清"
  - [ ] 2.2.4 默认返回 "普清"
- [ ] 2.3 添加 lal 库依赖
  - [ ] 2.3.1 在 `backend/go.mod` 中添加 `github.com/q191201771/lal` 依赖
  - [ ] 2.3.2 运行 `go mod download` 下载依赖
- [ ] 2.4 实现 `DetectResolutionFromStream(url string, timeout time.Duration) (string, error)` 函数
  - [ ] 2.4.1 使用 lal 库拉取视频流（支持 HTTP-FLV、HLS、RTMP 等协议）
  - [ ] 2.4.2 使用 lal 的 `pkg/avc` 或 `pkg/hevc` 解析视频流
  - [ ] 2.4.3 从 SPS (Sequence Parameter Set) 中提取分辨率信息（宽度 x 高度）
  - [ ] 2.4.4 设置超时控制（默认 10 秒），使用 context.WithTimeout
  - [ ] 2.4.5 根据宽度判断等级：≤720px→普清, 720px<宽度≤1080px→高清, >1080px→超清
  - [ ] 2.4.6 处理错误情况（超时、无法访问、格式不支持、协议不支持等）
  - [ ] 2.4.7 确保资源正确释放（关闭连接、清理缓冲区）
- [ ] 2.5 编写单元测试，覆盖各种路径格式
- [ ] 2.6 编写集成测试，测试实际流检测（使用 lal 库，需要测试视频流）

## 3. 后端实现 - 数据模型更新
- [ ] 3.1 更新 `backend/internal/models/video_stream_endpoint.go`
  - [ ] 3.1.1 在 `VideoStreamEndpoint` 结构体中添加 `Resolution string` 字段
  - [ ] 3.1.2 添加 JSON 和数据库标签
- [ ] 3.2 更新 Swagger 注释（如需要）

## 4. 后端实现 - Repository 层更新
- [ ] 4.1 更新 `backend/internal/repositories/video_stream_endpoint_repository.go`
  - [ ] 4.1.1 在 `Create` 方法中调用分辨率识别并设置字段
  - [ ] 4.1.2 在 `Update` 方法中调用分辨率识别并更新字段
  - [ ] 4.1.3 在 `GenerateAll` 方法中为批量生成的端点识别分辨率
  - [ ] 4.1.4 更新 SQL 查询，包含 `resolution` 字段
- [ ] 4.2 添加 `UpdateResolution` 方法（用于手动更新）
- [ ] 4.3 更新 `GetAll` 方法，支持按分辨率筛选

## 5. 后端实现 - Service 层更新
- [ ] 5.1 更新 `backend/internal/services/video_stream_endpoint_service.go`
  - [ ] 5.1.1 确保所有创建/更新操作都包含分辨率识别
- [ ] 5.2 添加 `ReDetectResolution` 方法（用于重新识别所有端点）

## 6. 后端实现 - Handler 层更新
- [ ] 6.1 更新 `backend/internal/handlers/video_stream_endpoint_handler.go`
  - [ ] 6.1.1 更新响应结构，包含分辨率字段
  - [ ] 6.1.2 更新筛选器，支持按分辨率筛选
  - [ ] 6.1.3 添加 `TestResolution` 方法（测试播放并识别分辨率）
    - [ ] 6.1.3.1 获取端点信息
    - [ ] 6.1.3.2 调用流检测函数
    - [ ] 6.1.3.3 更新端点分辨率字段
    - [ ] 6.1.3.4 返回检测结果
- [ ] 6.2 在 `backend/cmd/main.go` 中添加路由：`POST /api/video-stream-endpoints/:id/test-resolution`
- [ ] 6.3 更新 Swagger 文档注释

## 7. 数据迁移脚本
- [ ] 7.1 创建批量识别脚本（Ruby 或 Go）
- [ ] 7.2 为所有现有端点识别并更新分辨率
- [ ] 7.3 验证识别结果准确性

## 8. 前端实现 - 类型定义更新
- [ ] 8.1 更新 `frontend/src/lib/api.ts`
  - [ ] 8.1.1 在 `VideoStreamEndpoint` 类型中添加 `resolution?: string` 字段
  - [ ] 8.1.2 添加 `testResolution` API 方法：`testResolution(id: number): Promise<{ resolution: string }>`

## 9. 前端实现 - 页面更新
- [ ] 9.1 更新 `frontend/src/pages/VideoStreamEndpointsPage.tsx`
  - [ ] 9.1.1 在表格中添加分辨率列
  - [ ] 9.1.2 添加分辨率筛选器（下拉选择：全部、普清、高清、超清）
  - [ ] 9.1.3 更新 CSV 导出，包含分辨率字段
  - [ ] 9.1.4 添加分辨率标签样式（不同颜色区分）
  - [ ] 9.1.5 在操作列添加"分辨率检测"按钮
    - [ ] 9.1.5.1 按钮文本："分辨率检测" 或图标按钮
    - [ ] 9.1.5.2 按钮位置：每行端点的操作列中
    - [ ] 9.1.5.3 按钮样式：使用 Ant Design 的 Button 组件
  - [ ] 9.1.6 实现分辨率检测功能
    - [ ] 9.1.6.1 点击"分辨率检测"按钮后调用测试 API (`POST /api/video-stream-endpoints/:id/test-resolution`)
    - [ ] 9.1.6.2 显示加载状态（按钮显示 loading，或显示"检测中..."提示）
    - [ ] 9.1.6.3 禁用按钮防止重复点击（检测期间）
    - [ ] 9.1.6.4 显示检测结果（成功消息：已更新为"普清"/"高清"/"超清"）
    - [ ] 9.1.6.5 自动刷新表格数据，更新当前行的分辨率值
    - [ ] 9.1.6.6 处理错误情况（超时、无法访问、格式不支持等）
      - [ ] 显示错误提示消息
      - [ ] 恢复按钮状态
    - [ ] 9.1.6.7 可选：显示检测到的实际分辨率值（如 "1920x1080"）作为提示信息

## 10. 测试
- [ ] 10.1 后端单元测试
  - [ ] 10.1.1 测试分辨率识别函数（各种路径格式）
  - [ ] 10.1.2 测试 Repository 创建/更新逻辑
- [ ] 10.2 后端集成测试
  - [ ] 10.2.1 测试创建端点时自动识别分辨率
  - [ ] 10.2.2 测试更新端点时重新识别分辨率
  - [ ] 10.2.3 测试按分辨率筛选
- [ ] 10.3 前端测试
  - [ ] 10.3.1 测试分辨率显示
  - [ ] 10.3.2 测试分辨率筛选功能

## 11. 文档更新
- [ ] 11.1 更新 API 文档（Swagger）
- [ ] 11.2 更新项目文档（如需要）

