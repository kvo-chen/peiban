import express from 'express';
import { getDeviceActions, addDeviceAction, updateDeviceAction, deleteDeviceAction } from '../controllers/deviceAction';
import auth from '../middleware/auth';

const router = express.Router();

// 获取设备的动作列表
router.get('/:deviceId', auth, getDeviceActions);

// 为设备添加动作映射
router.post('/', auth, addDeviceAction);

// 更新设备动作映射
router.put('/:id', auth, updateDeviceAction);

// 删除设备动作映射
router.delete('/:id', auth, deleteDeviceAction);

export default router;
