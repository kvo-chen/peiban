"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const auth_1 = __importDefault(require("./routes/auth"));
const device_1 = __importDefault(require("./routes/device"));
const action_1 = __importDefault(require("./routes/action"));
const deviceAction_1 = __importDefault(require("./routes/deviceAction"));
const chat_1 = __importDefault(require("./routes/chat"));
const userManagement_1 = __importDefault(require("./routes/userManagement"));
const deviceGroup_1 = __importDefault(require("./routes/deviceGroup"));
const dataAnalysis_1 = __importDefault(require("./routes/dataAnalysis"));
const deviceHeartbeat_1 = __importDefault(require("./routes/deviceHeartbeat"));
const responseHandler_1 = __importDefault(require("./middleware/responseHandler"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const action_2 = require("./controllers/action");
// WebSocket服务
const websocketService_1 = __importDefault(require("./services/websocketService"));
// Swagger配置
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./config/swagger"));
// 加载环境变量
dotenv_1.default.config();
// 连接数据库并初始化基本动作
(0, db_1.connectDB)().then(() => {
    (0, action_2.initBasicActions)();
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// 中间件
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(responseHandler_1.default);
// 路由
app.get('/', (req, res) => {
    res.send('AI陪伴机器人后端服务');
});
// 认证路由
app.use('/api/auth', auth_1.default);
// 设备路由
app.use('/api/devices', device_1.default);
// 设备心跳路由
app.use('/api/device-heartbeat', deviceHeartbeat_1.default);
// 动作路由
app.use('/api/actions', action_1.default);
// 设备动作映射路由
app.use('/api/device-actions', deviceAction_1.default);
// 对话路由
app.use('/api/chat', chat_1.default);
// 用户管理路由
app.use('/api/admin', userManagement_1.default);
// 设备分组路由
app.use('/api/device-groups', deviceGroup_1.default);
// 数据分析路由
app.use('/api/analytics', dataAnalysis_1.default);
// Swagger API文档
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
// 全局错误处理中间件（必须放在所有路由之后）
app.use(errorHandler_1.default);
// 创建HTTP服务器
const server = (0, http_1.createServer)(app);
// 初始化WebSocket服务
websocketService_1.default.init(server);
// 启动服务器
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger API文档地址: http://localhost:${PORT}/api-docs`);
    console.log(`WebSocket服务已启动，支持设备状态实时监控`);
});
//# sourceMappingURL=index.js.map