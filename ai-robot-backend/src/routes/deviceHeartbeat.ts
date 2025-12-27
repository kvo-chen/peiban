import express from 'express';
import { deviceHeartbeat, setDeviceOffline } from '../controllers/deviceHeartbeat';

const router = express.Router();

// 设备心跳API，用于更新设备状态为在线
router.post('/heartbeat', deviceHeartbeat);

// 设置设备离线状态API
router.post('/offline', setDeviceOffline);

export default router;