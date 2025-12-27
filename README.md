# AI陪伴机器人平台

一个基于AI对话的机器人动作控制系统，支持用户通过自然语言与机器人交互，自定义和执行机器人动作。

## 功能特性

- **用户认证系统**：注册、登录、JWT认证
- **设备管理**：添加、编辑、删除机器人设备
- **动作库**：基础动作初始化和自定义动作管理
- **AI聊天**：集成OpenAI API，支持自然语言交互
- **设备-动作映射**：为不同设备配置不同动作
- **响应式设计**：适配不同屏幕尺寸

## 技术栈

### 后端
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT认证
- OpenAI API集成

### 前端
- React + TypeScript + Vite
- React Router DOM
- Axios

## 项目结构

```
ai-robot-platform/
├── ai-robot-backend/       # 后端服务
│   ├── src/
│   │   ├── config/          # 配置文件
│   │   ├── controllers/     # 控制器
│   │   ├── middleware/      # 中间件
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由
│   │   └── index.ts         # 入口文件
│   └── package.json
└── ai-robot-frontend/       # 前端应用
    ├── src/
    │   ├── components/      # React组件
    │   ├── pages/           # 页面组件
    │   ├── services/        # API服务
    │   ├── types/           # TypeScript类型
    │   └── App.tsx          # 应用入口
    └── package.json
```

## 快速开始

### 后端设置

1. 进入后端目录
```bash
cd ai-robot-backend
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
创建 `.env` 文件，添加以下内容：
```
PORT=3002
MONGO_URI=mongodb://localhost:27017/ai-robot
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-api-key
```

4. 启动后端服务
```bash
npm run dev
```

### 前端设置

1. 进入前端目录
```bash
cd ai-robot-frontend
```

2. 安装依赖
```bash
npm install
```

3. 启动前端服务
```bash
npm run dev
```

4. 访问应用
打开浏览器访问 http://localhost:5173

## 使用说明

1. **注册账号**：在登录页面点击"立即注册"，填写信息注册账号
2. **登录**：使用注册的账号登录
3. **添加设备**：在设备管理页面点击"添加设备"，填写设备信息
4. **配置动作**：在设备详情页面，为设备添加和配置动作
5. **AI对话**：在设备详情页面的聊天框中输入指令，与机器人交互

## API文档

### 认证API
- POST `/api/auth/register` - 用户注册
- POST `/api/auth/login` - 用户登录
- GET `/api/auth/me` - 获取当前用户信息

### 设备API
- GET `/api/devices` - 获取设备列表
- POST `/api/devices` - 添加设备
- GET `/api/devices/:id` - 获取单个设备
- PUT `/api/devices/:id` - 更新设备
- DELETE `/api/devices/:id` - 删除设备

### 动作API
- GET `/api/actions` - 获取动作列表
- POST `/api/actions` - 创建动作
- GET `/api/actions/:id` - 获取单个动作
- PUT `/api/actions/:id` - 更新动作
- DELETE `/api/actions/:id` - 删除动作

### 设备动作映射API
- GET `/api/device-actions/:deviceId` - 获取设备动作映射
- POST `/api/device-actions` - 创建设备动作映射
- PUT `/api/device-actions/:id` - 更新设备动作映射
- DELETE `/api/device-actions/:id` - 删除设备动作映射

### 聊天API
- POST `/api/chat` - 发送聊天消息
- GET `/api/chat/:deviceId` - 获取聊天历史

## 开发计划

- [ ] 支持更多设备类型
- [ ] 增强AI对话能力
- [ ] 添加动作组合功能
- [ ] 支持设备分组管理
- [ ] 添加数据分析功能

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License