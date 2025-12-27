import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import Device from '../models/Device';
import { Cache } from '../config/redis';
import websocketService from '../services/websocketService';
import { Op } from 'sequelize';

/**
 * @swagger
 * /devices: 
 *   get:
 *     summary: 获取用户的设备列表
 *     tags: [设备管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索设备名称或类型
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 设备状态过滤
 *       - in: query
 *         name: deviceType
 *         schema:
 *           type: string
 *         description: 设备类型过滤
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 分页页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 成功获取设备列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 操作成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     devices:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Device'
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: 服务器错误
 */
export const getDevices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, status, deviceType, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    // 构建查询条件
    const whereClause: any = {
      user_id: req.user.id
    };
    
    // 添加搜索条件
    if (search) {
      whereClause[Op.or] = [
        { device_name: { [Op.like]: `%${search}%` } },
        { device_type: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // 添加状态过滤
    if (status) {
      whereClause.status = status;
    }
    
    // 添加设备类型过滤
    if (deviceType) {
      whereClause.device_type = deviceType;
    }
    
    // 构建缓存键，包含所有查询参数
    const cacheKey = `devices:${req.user.id}:${search || 'all'}:${status || 'all'}:${deviceType || 'all'}:${page}:${limit}`;
    
    // 先尝试从缓存获取
    const cachedDevices = await Cache.get(cacheKey);
    
    if (cachedDevices) {
      // 如果缓存存在，直接返回缓存数据
      return (res as any).success(cachedDevices);
    }
    
    // 缓存不存在，从数据库获取
    const { count, rows: devices } = await Device.findAndCountAll({
      where: whereClause,
      offset,
      limit: limitNum,
      order: [['created_at', 'DESC']]
    });
    
    // 转换为普通对象，避免序列化问题
    const devicesJSON = devices.map(device => typeof device.toJSON === 'function' ? device.toJSON() : device);
    
    // 准备响应数据
    const responseData = {
      devices: devicesJSON,
      total: count,
      page: pageNum,
      limit: limitNum
    };
    
    // 尝试设置缓存，但不影响主要功能
    try {
      await Cache.set(cacheKey, responseData, 600);
    } catch (cacheError) {
      console.error('Cache error:', cacheError);
      // 缓存失败不影响主要功能
    }
    
    (res as any).success(responseData);
  } catch (error) {
    console.error('Error getting devices:', error);
    (res as any).error(500, '服务器错误');
  }
};

/**
 * @swagger
 * /devices: 
 *   post:
 *     summary: 绑定新设备
 *     tags: [设备管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceName
 *               - deviceType
 *             properties:
 *               deviceName:
 *                 type: string
 *                 description: 设备名称
 *                 example: 智能音箱
 *               deviceType:
 *                 type: string
 *                 description: 设备类型
 *                 example: speaker
 *     responses:
 *       201:
 *         description: 设备绑定成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: 设备绑定成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     device:
 *                       $ref: '#/components/schemas/Device'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
 */
export const addDevice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deviceName, deviceType } = req.body;
    
    // 创建新设备
    const device = await Device.create({
      user_id: req.user.id,
      device_name: deviceName,
      device_type: deviceType
    });
    
    // 清除设备列表缓存
    const cacheKey = `devices:${req.user.id}`;
    await Cache.del(cacheKey);
    
    (res as any).created({ device: typeof device.toJSON === 'function' ? device.toJSON() : device }, '设备绑定成功');
  } catch (error) {
    (res as any).error(500, '服务器错误');
  }
};

// 更新设备信息
export const updateDevice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { deviceName, deviceType, status } = req.body;
    
    // 检查设备是否存在且属于当前用户
    const device = await Device.findOne({
      where: { id, user_id: req.user.id }
    });
    if (!device) {
      return (res as any).error(404, '设备不存在');
    }
    
    // 检查状态是否变化
    const statusChanged = status && status !== device.status;
    
    // 更新设备信息
    await Device.update(
      { device_name: deviceName, device_type: deviceType, status },
      { where: { id } }
    );
    
    // 获取更新后的设备信息
    const updatedDevice = await Device.findByPk(id);
    
    // 清除设备列表缓存和设备详情缓存
    const cacheKey = `devices:${req.user.id}`;
    const deviceCacheKey = `device:${id}`;
    await Cache.del(cacheKey);
    await Cache.del(deviceCacheKey);
    
    // 如果状态变化，通过WebSocket推送更新
    if (statusChanged && updatedDevice) {
      websocketService.sendDeviceStatusUpdate(req.user.id, parseInt(id), updatedDevice.status);
    }
    
    (res as any).success({ device: updatedDevice ? (typeof updatedDevice.toJSON === 'function' ? updatedDevice.toJSON() : updatedDevice) : null }, '设备信息更新成功');
  } catch (error) {
    (res as any).error(500, '服务器错误');
  }
};

// 解绑设备
export const removeDevice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // 检查设备是否存在且属于当前用户
    const device = await Device.findOne({
      where: { id, user_id: req.user.id }
    });
    if (!device) {
      return (res as any).error(404, '设备不存在');
    }
    
    // 删除设备
    await Device.destroy({
      where: { id }
    });
    
    // 清除设备列表缓存和设备详情缓存
    const cacheKey = `devices:${req.user.id}`;
    const deviceCacheKey = `device:${id}`;
    await Cache.del(cacheKey);
    await Cache.del(deviceCacheKey);
    
    (res as any).success(null, '设备解绑成功');
  } catch (error) {
    (res as any).error(500, '服务器错误');
  }
};

// 获取单个设备信息
export const getDevice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // 尝试从缓存获取
    const cacheKey = `device:${id}`;
    const cachedDevice = await Cache.get(cacheKey);
    
    if (cachedDevice) {
      return (res as any).success({ device: cachedDevice });
    }
    
    // 从数据库获取
    const device = await Device.findOne({
      where: { id, user_id: req.user.id }
    });
    if (!device) {
      return (res as any).error(404, '设备不存在');
    }
    
    // 转换为普通对象，避免序列化问题
    const deviceJSON = typeof device.toJSON === 'function' ? device.toJSON() : device;
    await Cache.set(cacheKey, deviceJSON, 900);
    
    (res as any).success({ device: deviceJSON });
  } catch (error) {
    (res as any).error(500, '服务器错误');
  }
};

/**
 * @swagger
 * /devices/batch-delete: 
 *   post:
 *     summary: 批量删除设备
 *     tags: [设备管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceIds
 *             properties:
 *               deviceIds:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: 设备ID数组
 *     responses:
 *       200:
 *         description: 批量删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 批量删除设备成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
 */
export const batchDeleteDevices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deviceIds } = req.body;
    
    if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
      return (res as any).error(400, '设备ID数组不能为空');
    }
    
    // 批量删除设备
    const result = await Device.destroy({
      where: {
        id: { [Op.in]: deviceIds },
        user_id: req.user.id
      }
    });
    
    // 清除相关缓存
    const cacheKey = `devices:${req.user.id}`;
    await Cache.delPattern(`${cacheKey}:*`); // 清除所有设备列表缓存
    deviceIds.forEach(async (id: number) => {
      const deviceCacheKey = `device:${id}`;
      await Cache.del(deviceCacheKey); // 清除单个设备缓存
    });
    
    (res as any).success({ deletedCount: result }, '批量删除设备成功');
  } catch (error) {
    console.error('Error batch deleting devices:', error);
    (res as any).error(500, '服务器错误');
  }
};

/**
 * @swagger
 * /devices/batch-update-status: 
 *   post:
 *     summary: 批量更新设备状态
 *     tags: [设备管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceIds
 *               - status
 *             properties:
 *               deviceIds:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: 设备ID数组
 *               status:
 *                 type: string
 *                 description: 设备状态
 *                 enum: [online, offline, maintenance]
 *     responses:
 *       200:
 *         description: 批量更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 批量更新设备状态成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedCount:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
 */
export const batchUpdateDevicesStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deviceIds, status } = req.body;
    
    if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
      return (res as any).error(400, '设备ID数组不能为空');
    }
    
    if (!['online', 'offline', 'maintenance'].includes(status)) {
      return (res as any).error(400, '无效的设备状态');
    }
    
    // 批量更新设备状态
    const result = await Device.update(
      { status },
      {
        where: {
          id: { [Op.in]: deviceIds },
          user_id: req.user.id
        }
      }
    );
    
    // 清除相关缓存
    const cacheKey = `devices:${req.user.id}`;
    await Cache.delPattern(`${cacheKey}:*`); // 清除所有设备列表缓存
    deviceIds.forEach(async (id: number) => {
      const deviceCacheKey = `device:${id}`;
      await Cache.del(deviceCacheKey); // 清除单个设备缓存
      // 通过WebSocket推送状态更新
      websocketService.sendDeviceStatusUpdate(req.user.id, id, status as 'online' | 'offline');
    });
    
    (res as any).success({ updatedCount: result[0] }, '批量更新设备状态成功');
  } catch (error) {
    console.error('Error batch updating devices status:', error);
    (res as any).error(500, '服务器错误');
  }
};
