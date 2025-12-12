# 视频流区域与 CDN 线路关联设计

## 问题分析

### 当前情况
- 多个 CDN 厂商都有相同 `name` 的线路（如火山引擎、腾讯云、网宿科技都有 `name="kkw"`）
- 视频流区域的 `code` 是 `"kkw"`
- 当前匹配规则：`line.Name == stream.Code`
- **问题**：一个流区域会匹配所有厂商的相同 `name` 的线路

### 业务需求
需要支持两种场景：
1. **通用匹配**：流区域匹配所有厂商的相同 `name` 的线路（当前行为）
2. **精确匹配**：流区域只匹配特定厂商的线路

## 设计方案

### 方案：在流区域中添加可选的 `provider_id` 字段

#### 数据库设计
```sql
CREATE TABLE streams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    provider_id BIGINT REFERENCES cdn_providers(id) ON DELETE SET NULL,  -- 新增字段
    ...
);
```

#### 匹配规则
- `provider_id = NULL`：匹配所有厂商的相同 `name` 的线路（通用匹配）
- `provider_id = 特定值`：只匹配该厂商的相同 `name` 的线路（精确匹配）

#### 匹配逻辑
```go
// 1. 检查 line.name == stream.code
if line.Name != stream.Code {
    continue
}

// 2. 检查厂商匹配
// 如果 stream.provider_id 为 NULL，匹配所有厂商
// 如果 stream.provider_id 有值，只匹配该厂商
if stream.ProviderID != nil && line.ProviderID != *stream.ProviderID {
    continue
}
```

## 实现细节

### 1. 数据库变更
- ✅ 在 `streams` 表中添加 `provider_id` 字段（可选，可为 NULL）
- ✅ 添加外键约束：`REFERENCES cdn_providers(id) ON DELETE SET NULL`
- ✅ 添加索引：`idx_streams_provider_id`

### 2. 模型变更
- ✅ `Stream` 结构体添加 `ProviderID *int64` 字段
- ✅ `Stream` 结构体添加 `Provider *CDNProvider` 字段（关联查询）
- ✅ `CreateStreamRequest` 和 `UpdateStreamRequest` 添加 `ProviderID *int64` 字段

### 3. Repository 层
- ✅ `GetAll()` 使用 LEFT JOIN 加载 provider 信息
- ✅ `GetByID()` 使用 LEFT JOIN 加载 provider 信息
- ✅ `Create()` 和 `Update()` 支持 `provider_id` 参数
- ✅ 验证 `provider_id` 是否存在（如果提供）

### 4. Service 层
- ✅ `Create()` 和 `Update()` 传递 `provider_id` 参数

### 5. 端点生成逻辑
- ✅ `GenerateAll()` 方法更新匹配规则：
  - 首先检查 `line.Name == stream.Code`
  - 然后检查 `stream.ProviderID == NULL` 或 `line.ProviderID == stream.ProviderID`

## 使用示例

### 示例 1：通用匹配（匹配所有厂商）
```sql
INSERT INTO streams (name, code, provider_id) VALUES
    ('亚洲区', 'kkw', NULL);  -- NULL 表示匹配所有厂商的 kkw 线路
```

结果：会匹配火山引擎、腾讯云、网宿科技的所有 `name="kkw"` 的线路

### 示例 2：精确匹配（只匹配特定厂商）
```sql
INSERT INTO streams (name, code, provider_id) VALUES
    ('亚洲区-火山引擎', 'kkw', 1);  -- 只匹配火山引擎的 kkw 线路
```

结果：只会匹配火山引擎的 `name="kkw"` 的线路

## 优势

1. **灵活性**：支持通用匹配和精确匹配两种场景
2. **向后兼容**：现有流区域的 `provider_id` 为 NULL，行为不变
3. **语义清晰**：`provider_id` 字段明确表达了关联关系
4. **数据库约束**：使用外键确保数据一致性
5. **简单易用**：前端只需添加一个可选的厂商选择框

## 前端实现建议

在流区域表单中添加可选的厂商选择：
- 如果选择厂商：精确匹配该厂商的线路
- 如果不选择厂商（留空）：匹配所有厂商的线路

## 注意事项

1. **数据迁移**：现有流区域的 `provider_id` 默认为 NULL，保持当前行为
2. **删除行为**：如果删除厂商，相关流区域的 `provider_id` 会被设置为 NULL（`ON DELETE SET NULL`）
3. **唯一性**：流区域的 `code` 仍然保持全局唯一，不受 `provider_id` 影响

