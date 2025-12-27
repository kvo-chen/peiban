import express from 'express';
import { getActions, createAction, updateAction, deleteAction, getAction, executeAction } from '../controllers/action';
import auth from '../middleware/auth';

const router = express.Router();

// 获取动作列表
router.get('/', auth, getActions);

// 创建新动作
router.post('/', auth, createAction);

// 获取单个动作信息
router.get('/:id', auth, getAction);

// 更新动作信息
router.put('/:id', auth, updateAction);

// 删除动作
router.delete('/:id', auth, deleteAction);

// 执行动作或动作组合
router.post('/execute', auth, executeAction);

export default router;
