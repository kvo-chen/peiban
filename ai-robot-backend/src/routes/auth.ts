import express from 'express';
import { register, login, getCurrentUser, sendCode, phoneLogin } from '../controllers/auth';
import auth from '../middleware/auth';

const router = express.Router();

// 公共路由
router.post('/register', register);
router.post('/login', login);
router.post('/send-code', sendCode); // 发送验证码
router.post('/phone-login', phoneLogin); // 手机号验证码登录

// 需要认证的路由
router.get('/me', auth, getCurrentUser);

export default router;
