# AI陪伴机器人平台API开发文档

## 1. 概述

### 1.1 文档说明

本文档描述了AI陪伴机器人平台的API接口，基于RESTful设计风格，使用JSON格式进行数据交换。文档包括接口定义、参数说明、返回值格式、错误码解释和调用示例。

### 1.2 基本信息

- **API地址**：`http://localhost:3000/api`
- **API版本**：v1
- **认证方式**：JWT Token
- **请求格式**：JSON
- **响应格式**：JSON

### 1.3 认证方式

所有API接口（除登录注册外）都需要在请求头中添加`Authorization`字段，格式如下：

```
Authorization: Bearer <token>
```

### 1.4 错误码

| 错误码 | 描述 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 2. 认证模块

### 2.1 注册

**请求地址**：`POST /api/auth/register`

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| email | string | 是 | 邮箱 |
| password | string | 是 | 密码 |

**返回示例**：

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "test",
    "email": "test@example.com"
  }
}
```

### 2.2 登录

**请求地址**：`POST /api/auth/login`

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| email | string | 是 | 邮箱 |
| password | string | 是 | 密码 |

**返回示例**：

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "test",
    "email": "test@example.com"
  }
}
```

### 2.3 获取当前用户信息

**请求地址**：`GET /api/auth/me`

**返回示例**：

```json
{
  "user": {
    "id": 1,
    "username": "test",
    "email": "test@example.com"
  }
}
```

## 3. 设备管理模块

### 3.1 获取设备列表

**请求地址**：`GET /api/devices`

**返回示例**：

```json
{
  "devices": [
    {
      "id": 1,
      "device_name": "机器人1号",
      "device_type": "type1",
      "status": "online",
      "created_at": "2025-12-25T00:00:00.000Z"
    }
  ]
}
```

### 3.2 添加设备

**请求地址**：`POST /api/devices`

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| device_name | string | 是 | 设备名称 |
| device_type | string | 是 | 设备类型 |

**返回示例**：

```json
{
  "message": "Device added successfully",
  "device": {
    "id": 1,
    "device_name": "机器人1号",
    "device_type": "type1",
    "status": "offline",
    "created_at": "2025-12-25T00:00:00.000Z"
  }
}
```

### 3.3 获取设备详情

**请求地址**：`GET /api/devices/:id`

**返回示例**：

```json
{
  "device": {
    "id": 1,
    "device_name": "机器人1号",
    "device_type": "type1",
    "status": "online",
    "created_at": "2025-12-25T00:00:00.000Z"
  }
}
```

### 3.4 更新设备

**请求地址**：`PUT /api/devices/:id`

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| device_name | string | 否 | 设备名称 |
| device_type | string | 否 | 设备类型 |
| status | string | 否 | 设备状态 |

**返回示例**：

```json
{
  "message": "Device updated successfully",
  "device": {
    "id": 1,
    "device_name": "机器人2号",
    "device_type": "type1",
    "status": "online",
    "created_at": "2025-12-25T00:00:00.000Z"
  }
}
```

### 3.5 删除设备

**请求地址**：`DELETE /api/devices/:id`

**返回示例**：

```json
{
  "message": "Device removed successfully"
}
```

## 4. 动作管理模块

### 4.1 获取动作列表

**请求地址**：`GET /api/actions`

**返回示例**：

```json
{
  "actions": [
    {
      "id": 1,
      "name": "前进",
      "description": "机器人前进",
      "type": "basic",
      "duration": 2
    }
  ]
}
```

### 4.2 创建动作

**请求地址**：`POST /api/actions`

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| name | string | 是 | 动作名称 |
| description | string | 否 | 动作描述 |
| type | string | 是 | 动作类型（basic/custom） |
| duration | number | 是 | 动作时长（秒） |
| steps | array | 否 | 动作步骤 |

**返回示例**：

```json
{
  "message": "Action created successfully",
  "action": {
    "id": 2,
    "name": "自定义动作",
    "description": "测试自定义动作",
    "type": "custom",
    "duration": 3,
    "steps": ["step1", "step2"]
  }
}
```

### 4.3 更新动作

**请求地址**：`PUT /api/actions/:id`

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| name | string | 否 | 动作名称 |
| description | string | 否 | 动作描述 |
| duration | number | 否 | 动作时长（秒） |
| steps | array | 否 | 动作步骤 |

**返回示例**：

```json
{
  "message": "Action updated successfully",
  "action": {
    "id": 2,
    "name": "更新后的动作",
    "description": "测试自定义动作",
    "type": "custom",
    "duration": 4,
    "steps": ["step1", "step2", "step3"]
  }
}
```

### 4.4 删除动作

**请求地址**：`DELETE /api/actions/:id`

**返回示例**：

```json
{
  "message": "Action deleted successfully"
}
```

## 5. 设备动作模块

### 5.1 绑定设备动作

**请求地址**：`POST /api/device-actions`

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| device_id | number | 是 | 设备ID |
| action_id | number | 是 | 动作ID |
| prompt | string | 是 | 触发提示词 |

**返回示例**：

```json
{
  "message": "Device action added successfully",
  "deviceAction": {
    "id": 1,
    "device_id": 1,
    "action_id": 1,
    "prompt": "前进"
  }
}
```

### 5.2 获取设备动作列表

**请求地址**：`GET /api/device-actions/:deviceId`

**返回示例**：

```json
{
  "deviceActions": [
    {
      "id": 1,
      "device_id": 1,
      "action_id": 1,
      "prompt": "前进",
      "action": {
        "id": 1,
        "name": "前进",
        "description": "机器人前进",
        "type": "basic",
        "duration": 2
      }
    }
  ]
}
```

## 6. AI对话模块

### 6.1 发送消息

**请求地址**：`POST /api/chat`

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| device_id | number | 是 | 设备ID |
| message | string | 是 | 消息内容 |

**返回示例**：

```json
{
  "message": "AI response",
  "response": "好的，我将执行前进动作",
  "action_triggered": {
    "id": 1,
    "name": "前进",
    "description": "机器人前进",
    "type": "basic",
    "duration": 2
  }
}
```

## 7. 管理模块

### 7.1 获取用户列表

**请求地址**：`GET /api/admin/users`

**返回示例**：

```json
[
  {
    "id": 1,
    "username": "test",
    "email": "test@example.com",
    "role_id": 2,
    "status": "active",
    "role": {
      "name": "普通用户",
      "description": "普通用户角色"
    }
  }
]
```

### 7.2 获取角色列表

**请求地址**：`GET /api/admin/roles`

**返回示例**：

```json
[
  {
    "id": 1,
    "name": "管理员",
    "description": "系统管理员"
  },
  {
    "id": 2,
    "name": "普通用户",
    "description": "普通用户角色"
  }
]
```

### 7.3 获取操作日志

**请求地址**：`GET /api/admin/logs`

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| page | number | 否 | 页码（默认1） |
| limit | number | 否 | 每页条数（默认10） |

**返回示例**：

```json
{
  "logs": [
    {
      "id": 1,
      "user_id": 1,
      "username": "test",
      "operation": "login",
      "module": "auth",
      "ip": "127.0.0.1",
      "status": "success",
      "details": "User login",
      "created_at": "2025-12-25T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

## 8. 数据分析模块

### 8.1 获取设备统计数据

**请求地址**：`GET /api/analysis/device-stats`

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| start_date | string | 否 | 开始日期（YYYY-MM-DD） |
| end_date | string | 否 | 结束日期（YYYY-MM-DD） |

**返回示例**：

```json
{
  "deviceStats": [
    {
      "name": "设备1",
      "onlineHours": 120,
      "totalActions": 500
    }
  ]
}
```

### 8.2 获取每日动作统计

**请求地址**：`GET /api/analysis/daily-stats`

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| start_date | string | 否 | 开始日期（YYYY-MM-DD） |
| end_date | string | 否 | 结束日期（YYYY-MM-DD） |

**返回示例**：

```json
{
  "dailyStats": [
    {
      "date": "2025-12-25",
      "actions": 80
    }
  ]
}
```

## 9. 开发工具

### 9.1 Swagger文档

访问地址：`http://localhost:3000/api-docs`

支持在线调试功能，包含所有API接口的详细说明和请求响应示例。

### 9.2 SDK支持

平台提供多种语言的SDK支持，包括：
- JavaScript/TypeScript
- Python
- Java
- Go

## 10. 最佳实践

### 10.1 错误处理

建议在调用API时实现完善的错误处理机制，包括：
- 检查响应状态码
- 处理网络错误
- 实现重试机制

### 10.2 性能优化

- 合理使用缓存
- 减少不必要的API调用
- 使用批量操作
- 优化请求参数

### 10.3 安全建议

- 保护好API密钥
- 使用HTTPS协议
- 实现请求频率限制
- 定期更新token

---

**版本**：1.0.0
**生效日期**：2025-12-25
