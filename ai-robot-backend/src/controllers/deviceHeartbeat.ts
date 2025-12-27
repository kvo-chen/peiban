import { Request, Response } from 'express';
import Device from '../models/Device';
import { Cache } from '../config/redis';
import websocketService from '../services/websocketService';

// 设备心跳更新状态
export const deviceHeartbeat = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.body;
    
    if (!deviceId) {
      return (res as any).error(400, '设备ID不能为空');
    }
    
    // 查找设备
    const device = await Device.findByPk(deviceId);
    if (!device) {
      return (res as any).error(404, '设备不存在');
    }
    
    // 检查状态是否需要更新
    const statusChanged = device.status !== 'online';
    
    // 更新设备状态为在线
    await Device.update(
      { status: 'online', updated_at: new Date() },
      { where: { id: deviceId } }
    );
    
    // 清除设备列表缓存和设备详情缓存
    const cacheKey = `devices:${device.user_id}`;
    const deviceCacheKey = `device:${deviceId}`;
    await Cache.del(cacheKey);
    await Cache.del(deviceCacheKey);
    
    // 如果状态变化，通过WebSocket推送更新
    if (statusChanged) {
      websocketService.sendDeviceStatusUpdate(device.user_id, deviceId, 'online');
    }
    
    (res as any).success(null, '设备状态更新成功');
  } catch (error) {
    (res as any).error(500, '服务器错误');
  }
};

// 设置设备离线状态
export const setDeviceOffline = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.body;
    
    if (!deviceId) {
      return (res as any).error(400, '设备ID不能为空');
    }
    
    // 查找设备
    const device = await Device.findByPk(deviceId);
    if (!device) {
      return (res as any).error(404, '设备不存在');
    }
    
    // 检查状态是否需要更新
    const statusChanged = device.status !== 'offline';
    
    // 更新设备状态为离线
    await Device.update(
      { status: 'offline', updated_at: new Date() },
      { where: { id: deviceId } }
    );
    
    // 清除设备列表缓存和设备详情缓存
    const cacheKey = `devices:${device.user_id}`;
    const deviceCacheKey = `device:${deviceId}`;
    await Cache.del(cacheKey);
    await Cache.del(deviceCacheKey);
    
    // 如果状态变化，通过WebSocket推送更新
    if (statusChanged) {
      websocketService.sendDeviceStatusUpdate(device.user_id, deviceId, 'offline');
    }
    
    (res as any).success(null, '设备状态更新成功');
  } catch (error) {
    (res as any).error(500, '服务器错误');
  }
};