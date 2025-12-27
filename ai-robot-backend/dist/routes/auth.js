"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const auth_2 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
// 公共路由
router.post('/register', auth_1.register);
router.post('/login', auth_1.login);
router.post('/send-code', auth_1.sendCode); // 发送验证码
router.post('/phone-login', auth_1.phoneLogin); // 手机号验证码登录
// 需要认证的路由
router.get('/me', auth_2.default, auth_1.getCurrentUser);
exports.default = router;
//# sourceMappingURL=auth.js.map