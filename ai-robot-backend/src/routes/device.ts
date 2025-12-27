import express from 'express';
import { getDevices, addDevice, updateDevice, removeDevice, getDevice } from '../controllers/device';
import auth from '../middleware/auth';

const router = express.Router();

// 获取设备列表
router.get('/', auth, getDevices);

// 绑定新设备
router.post('/', auth, addDevice);

// 获取单个设备信息
router.get('/:id', auth, getDevice);

// 更新设备信息
router.put('/:id', auth, updateDevice);

// 解绑设备
router.delete('/:id', auth, removeDevice);

export default router;
