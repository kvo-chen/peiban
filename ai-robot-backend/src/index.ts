import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import deviceRoutes from './routes/device';
import actionRoutes from './routes/action';
import deviceActionRoutes from './routes/deviceAction';
import chatRoutes from './routes/chat';
import userManagementRoutes from './routes/userManagement';
import deviceGroupRoutes from './routes/deviceGroup';
import dataAnalysisRoutes from './routes/dataAnalysis';
import deviceHeartbeatRoutes from './routes/deviceHeartbeat';
import responseHandler from './middleware/responseHandler';
import errorHandler from './middleware/errorHandler';
import { initBasicActions } from './controllers/action';
// WebSocket服务
import websocketService from './services/websocketService';
// Swagger配置
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './config/swagger';
// 限流中间件
import { generalLimiter, authLimiter, deviceLimiter, chatLimiter } from './middleware/rateLimiter';

// 加载环境变量
dotenv.config();

// 连接数据库并初始化基本动作
connectDB().then(() => {
  initBasicActions();
});

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(responseHandler);

// 路由
app.get('/', (req, res) => {
  res.send('AI陪伴机器人后端服务');
});

// 认证路由 - 使用严格的认证限流
app.use('/api/auth', authLimiter, authRoutes);

// 设备路由 - 使用设备管理限流
app.use('/api/devices', deviceLimiter, deviceRoutes);

// 设备心跳路由 - 使用通用限流
app.use('/api/device-heartbeat', generalLimiter, deviceHeartbeatRoutes);

// 动作路由 - 使用通用限流
app.use('/api/actions', generalLimiter, actionRoutes);

// 设备动作映射路由 - 使用设备管理限流
app.use('/api/device-actions', deviceLimiter, deviceActionRoutes);

// 对话路由 - 使用聊天限流
app.use('/api/chat', chatLimiter, chatRoutes);

// 用户管理路由 - 使用通用限流
app.use('/api/admin', generalLimiter, userManagementRoutes);

// 设备分组路由 - 使用设备管理限流
app.use('/api/device-groups', deviceLimiter, deviceGroupRoutes);

// 数据分析路由 - 使用通用限流
app.use('/api/analytics', generalLimiter, dataAnalysisRoutes);

// Swagger API文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 全局错误处理中间件（必须放在所有路由之后）
app.use(errorHandler);

// 创建HTTP服务器
const server = createServer(app);

// 初始化WebSocket服务
websocketService.init(server);

// 启动服务器
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger API文档地址: http://localhost:${PORT}/api-docs`);
  console.log(`WebSocket服务已启动，支持设备状态实时监控`);
});
