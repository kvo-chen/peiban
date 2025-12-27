import express from 'express';
import { getDevices, addDevice, updateDevice, removeDevice, getDevice, batchDeleteDevices, batchUpdateDevicesStatus } from '../controllers/device';
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

// 批量删除设备
router.post('/batch-delete', auth, batchDeleteDevices);

// 批量更新设备状态
router.post('/batch-update-status', auth, batchUpdateDevicesStatus);

export default router;
