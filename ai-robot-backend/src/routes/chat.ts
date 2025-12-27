import express from 'express';
import { chatWithAI, getChatHistory } from '../controllers/chat';
import auth from '../middleware/auth';

const router = express.Router();

// AI对话
router.post('/', auth, chatWithAI);

// 获取对话历史
router.get('/:deviceId', auth, getChatHistory);

export default router;
