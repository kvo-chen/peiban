import request from 'supertest';
import express from 'express';
import deviceRoutes from '../routes/device';
import authMiddleware from '../middleware/auth';
import responseHandler from '../middleware/responseHandler';
import Device from '../models/Device';
import { Cache } from '../config/redis';

// 模拟认证中间件
jest.mock('../middleware/auth', () => {
  return (req: any, res: any, next: any) => {
    req.user = { id: 1 };
    next();
  };
});

// 模拟Cache工具
jest.mock('../config/redis', () => ({
  Cache: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    delBatch: jest.fn(),
    delPattern: jest.fn(),
    exists: jest.fn(),
    hget: jest.fn(),
    hset: jest.fn(),
    ttl: jest.fn(),
  }
}));

// 模拟Device模型
jest.mock('../models/Device', () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  findByPk: jest.fn(),
  findAndCountAll: jest.fn(),
}));

// 创建测试服务器
const app = express();
app.use(express.json());
app.use(responseHandler);
app.use('/api/devices', deviceRoutes);

describe('Device Routes', () => {
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
  });

  describe('GET /api/devices', () => {
    it('should return all devices for a user', async () => {
      // 模拟数据
      const mockDevices = [
        { id: 1, user_id: 1, device_name: '智能音箱', device_type: 'speaker', status: 'online', created_at: new Date(), updated_at: new Date() },
        { id: 2, user_id: 1, device_name: '智能灯泡', device_type: 'light', status: 'offline', created_at: new Date(), updated_at: new Date() },
      ];
      
      // 模拟Cache.get和Device.findAndCountAll
      (Cache.get as jest.Mock).mockResolvedValue(null);
      (Device.findAndCountAll as jest.Mock).mockResolvedValue({
        count: mockDevices.length,
        rows: mockDevices
      });
      
      // 发送请求
      const response = await request(app).get('/api/devices');
      
      // 验证结果
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.data.devices).toHaveLength(2);
      expect(response.body.data.devices[0].id).toBe(1);
      expect(response.body.data.devices[0].device_name).toBe('智能音箱');
      expect(response.body.data.devices[1].id).toBe(2);
      expect(response.body.data.devices[1].device_name).toBe('智能灯泡');
      expect(Cache.get).toHaveBeenCalledTimes(1);
      expect(Device.findAndCountAll).toHaveBeenCalledTimes(1);
      expect(Cache.set).toHaveBeenCalledTimes(1);
    });

    it('should return devices from cache if available', async () => {
      // 模拟缓存数据
      const mockCachedResponse = {
        devices: [
          { id: 1, user_id: 1, device_name: '智能音箱', device_type: 'speaker', status: 'online', created_at: new Date(), updated_at: new Date() },
        ],
        total: 1,
        page: 1,
        limit: 10
      };
      
      // 模拟Cache.get返回缓存数据
      (Cache.get as jest.Mock).mockResolvedValue(mockCachedResponse);
      
      // 发送请求
      const response = await request(app).get('/api/devices');
      
      // 验证结果
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.data.devices).toHaveLength(1);
      expect(response.body.data.devices[0].id).toBe(1);
      expect(Cache.get).toHaveBeenCalledTimes(1);
      expect(Device.findAndCountAll).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/devices', () => {
    it('should create a new device', async () => {
      // 模拟数据
      const mockDevice = { id: 1, user_id: 1, device_name: '智能门锁', device_type: 'lock', status: 'online', created_at: new Date(), updated_at: new Date() };
      
      // 模拟Device.create
      (Device.create as jest.Mock).mockResolvedValue(mockDevice);
      
      // 发送请求
      const response = await request(app)
        .post('/api/devices')
        .send({
          deviceName: '智能门锁',
          deviceType: 'lock'
        });
      
      // 验证结果
      expect(response.status).toBe(201);
      expect(response.body.code).toBe(201);
      expect(response.body.message).toBe('设备绑定成功');
      expect(response.body.data.device.id).toBe(1);
      expect(response.body.data.device.device_name).toBe('智能门锁');
      expect(Device.create).toHaveBeenCalledTimes(1);
      expect(Cache.del).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/devices/:id', () => {
    it('should return a single device', async () => {
      // 模拟数据
      const mockDevice = { id: 1, user_id: 1, device_name: '智能音箱', device_type: 'speaker', status: 'online', created_at: new Date(), updated_at: new Date() };
      
      // 模拟Cache.get和Device.findOne
      (Cache.get as jest.Mock).mockResolvedValue(null);
      (Device.findOne as jest.Mock).mockResolvedValue(mockDevice);
      
      // 发送请求
      const response = await request(app).get('/api/devices/1');
      
      // 验证结果
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.data.device.id).toBe(1);
      expect(response.body.data.device.device_name).toBe('智能音箱');
      expect(Cache.get).toHaveBeenCalledTimes(1);
      expect(Device.findOne).toHaveBeenCalledTimes(1);
      expect(Cache.set).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if device not found', async () => {
      // 模拟Cache.get和Device.findOne返回null
      (Cache.get as jest.Mock).mockResolvedValue(null);
      (Device.findOne as jest.Mock).mockResolvedValue(null);
      
      // 发送请求
      const response = await request(app).get('/api/devices/999');
      
      // 验证结果
      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.message).toBe('设备不存在');
      expect(Cache.get).toHaveBeenCalledTimes(1);
      expect(Device.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /api/devices/:id', () => {
    it('should update an existing device', async () => {
      // 模拟数据
      const mockDevice = { id: 1, user_id: 1, device_name: '智能音箱', device_type: 'speaker', status: 'online', created_at: new Date(), updated_at: new Date() };
      const updatedDevice = { ...mockDevice, device_name: '更新后的智能音箱', device_type: 'speaker', status: 'offline' };
      
      // 模拟Device.findOne、Device.update和Device.findByPk
      (Device.findOne as jest.Mock).mockResolvedValue(mockDevice);
      (Device.update as jest.Mock).mockResolvedValue([1]);
      (Device.findByPk as jest.Mock).mockResolvedValue(updatedDevice);
      
      // 发送请求
      const response = await request(app)
        .put('/api/devices/1')
        .send({
          deviceName: '更新后的智能音箱',
          deviceType: 'speaker',
          status: 'offline'
        });
      
      // 验证结果
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('设备信息更新成功');
      expect(response.body.data.device.id).toBe(1);
      expect(response.body.data.device.device_name).toBe('更新后的智能音箱');
      expect(response.body.data.device.status).toBe('offline');
      expect(Device.findOne).toHaveBeenCalledTimes(1);
      expect(Device.update).toHaveBeenCalledTimes(1);
      expect(Device.findByPk).toHaveBeenCalledTimes(1);
      expect(Cache.del).toHaveBeenCalledTimes(2);
    });

    it('should return 404 if device not found', async () => {
      // 模拟Device.findOne返回null
      (Device.findOne as jest.Mock).mockResolvedValue(null);
      
      // 发送请求
      const response = await request(app)
        .put('/api/devices/999')
        .send({
          deviceName: '不存在的设备',
          deviceType: 'unknown'
        });
      
      // 验证结果
      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.message).toBe('设备不存在');
      expect(Device.findOne).toHaveBeenCalledTimes(1);
      expect(Device.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/devices/:id', () => {
    it('should delete an existing device', async () => {
      // 模拟数据
      const mockDevice = { id: 1, user_id: 1, device_name: '智能音箱', device_type: 'speaker', status: 'online', created_at: new Date(), updated_at: new Date() };
      
      // 模拟Device.findOne和Device.destroy
      (Device.findOne as jest.Mock).mockResolvedValue(mockDevice);
      (Device.destroy as jest.Mock).mockResolvedValue(1);
      
      // 发送请求
      const response = await request(app).delete('/api/devices/1');
      
      // 验证结果
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('设备解绑成功');
      expect(Device.findOne).toHaveBeenCalledTimes(1);
      expect(Device.destroy).toHaveBeenCalledTimes(1);
      expect(Cache.del).toHaveBeenCalledTimes(2);
    });

    it('should return 404 if device not found', async () => {
      // 模拟Device.findOne返回null
      (Device.findOne as jest.Mock).mockResolvedValue(null);
      
      // 发送请求
      const response = await request(app).delete('/api/devices/999');
      
      // 验证结果
      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.message).toBe('设备不存在');
      expect(Device.findOne).toHaveBeenCalledTimes(1);
      expect(Device.destroy).not.toHaveBeenCalled();
    });
  });
});
