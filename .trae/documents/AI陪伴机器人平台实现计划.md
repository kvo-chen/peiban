# AI陪伴机器人平台实现计划

## 技术栈选择
- **前端**: React + TypeScript + Vite
- **后端**: Node.js + Express + MongoDB
- **AI服务**: OpenAI API (用于自然语言理解)
- **数据库**: MongoDB (存储用户数据、设备信息、动作库)

## 核心功能模块

### 1. 用户认证系统
- 注册、登录、注销功能
- JWT令牌认证
- 用户信息管理

### 2. 设备管理
- 设备绑定/解绑
- 设备状态查看
- 设备列表管理

### 3. 动作库管理
- 预设基本动作（前进、后退、趴下、起来等）
- 自定义动作创建
- 动作组合管理（如前进+右转）
- 动作时长设置（<3s）

### 4. AI对话系统
- 自然语言处理
- 指令识别与动作匹配
- 对话历史记录

### 5. 交互规则管理
- 动作组合规则
- 执行逻辑定义
- 反馈机制

## 数据库设计

### 用户表 (users)
- _id: ObjectId
- username: String
- password: String (加密存储)
- email: String
- created_at: Date

### 设备表 (devices)
- _id: ObjectId
- user_id: ObjectId (关联用户)
- device_name: String
- device_type: String
- status: String (online/offline)
- created_at: Date

### 动作表 (actions)
- _id: ObjectId
- name: String
- description: String
- type: String (basic/custom)
- duration: Number (秒)
- steps: Array (动作步骤)
- created_at: Date

### 设备动作映射表 (device_actions)
- _id: ObjectId
- device_id: ObjectId
- action_id: ObjectId
- prompt: String (触发提示词)
- created_at: Date

### 对话记录表 (conversations)
- _id: ObjectId
- user_id: ObjectId
- device_id: ObjectId
- message: String (用户消息)
- response: String (AI响应)
- action_triggered: ObjectId (触发的动作ID)
- created_at: Date

## 实现步骤

1. **项目初始化**
   - 创建前端项目（Vite + React + TypeScript）
   - 创建后端项目（Express + Node.js）
   - 配置MongoDB连接

2. **基础架构搭建**
   - 搭建后端API框架
   - 实现用户认证系统
   - 配置CORS和中间件

3. **数据库模型设计**
   - 定义所有数据模型
   - 创建数据库索引
   - 实现CRUD操作

4. **核心功能实现**
   - 设备管理功能
   - 动作库管理功能
   - AI对话系统集成
   - 动作执行逻辑

5. **前端界面开发**
   - 登录/注册页面
   - 设备管理页面
   - 动作库页面
   - AI对话界面
   - 交互规则配置页面

6. **AI集成**
   - 配置OpenAI API
   - 实现指令识别逻辑
   - 动作匹配算法

7. **测试与优化**
   - 单元测试
   - 集成测试
   - 性能优化
   - 界面优化

## 项目结构

### 前端 (ai-robot-frontend)
```
├── src/
│   ├── components/          # 通用组件
│   ├── pages/              # 页面组件
│   ├── services/           # API服务
│   ├── hooks/              # 自定义Hooks
│   ├── types/              # TypeScript类型定义
│   ├── App.tsx             # 应用入口
│   └── main.tsx            # 渲染入口
├── public/                 # 静态资源
└── package.json            # 依赖配置
```

### 后端 (ai-robot-backend)
```
├── src/
│   ├── controllers/        # 控制器
│   ├── models/             # 数据模型
│   ├── routes/             # 路由
│   ├── middleware/         # 中间件
│   ├── services/           # 业务逻辑
│   ├── config/             # 配置文件
│   └── app.ts              # 应用入口
├── .env                    # 环境变量
└── package.json            # 依赖配置
```

## 关键API设计

### 用户相关
- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录
- POST /api/auth/logout - 用户注销

### 设备相关
- POST /api/devices - 绑定设备
- GET /api/devices - 获取设备列表
- DELETE /api/devices/:id - 解绑设备

### 动作相关
- GET /api/actions - 获取动作列表
- POST /api/actions - 创建自定义动作
- PUT /api/actions/:id - 更新动作
- DELETE /api/actions/:id - 删除动作

### AI对话相关
- POST /api/chat - 发送消息，获取AI响应和动作

### 设备动作相关
- POST /api/device-actions - 绑定设备动作
- GET /api/device-actions/:deviceId - 获取设备动作列表

## 预期效果

1. 用户可以注册登录，管理自己的设备
2. 用户可以查看和创建动作，设置动作组合和时长
3. 用户可以通过AI对话控制机器人动作
4. 同一个型号的机器人可以执行不同动作，带来成就感
5. 培养用户对提示词的理解，提升逻辑和语言能力

## 后续扩展方向

1. 支持更多AI模型选择
2. 增加设备模拟器功能
3. 实现动作分享功能
4. 添加数据统计和分析
5. 支持多语言