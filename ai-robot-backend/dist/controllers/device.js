"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDevice = exports.removeDevice = exports.updateDevice = exports.addDevice = exports.getDevices = void 0;
const Device_1 = __importDefault(require("../models/Device"));
const redis_1 = require("../config/redis");
const websocketService_1 = __importDefault(require("../services/websocketService"));
/**
 * @swagger
 * /devices:
 *   get:
 *     summary: 获取用户的设备列表
 *     tags: [设备管理]
 *     security:
 *       - bearerAuth: []
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
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: 服务器错误
 */
const getDevices = async (req, res) => {
    try {
        // 尝试从缓存获取
        const cacheKey = `devices:${req.user.id}`;
        const cachedDevices = await redis_1.Cache.get(cacheKey);
        if (cachedDevices) {
            return res.success({ devices: cachedDevices });
        }
        // 从数据库获取
        const devices = await Device_1.default.findAll({
            where: { user_id: req.user.id }
        });
        // 转换为普通对象，避免序列化问题
        const devicesJSON = devices.map(device => typeof device.toJSON === 'function' ? device.toJSON() : device);
        await redis_1.Cache.set(cacheKey, devicesJSON, 600);
        res.success({ devices: devicesJSON });
    }
    catch (error) {
        res.error(500, '服务器错误');
    }
};
exports.getDevices = getDevices;
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
const addDevice = async (req, res) => {
    try {
        const { deviceName, deviceType } = req.body;
        // 创建新设备
        const device = await Device_1.default.create({
            user_id: req.user.id,
            device_name: deviceName,
            device_type: deviceType
        });
        // 清除设备列表缓存
        const cacheKey = `devices:${req.user.id}`;
        await redis_1.Cache.del(cacheKey);
        res.created({ device: typeof device.toJSON === 'function' ? device.toJSON() : device }, '设备绑定成功');
    }
    catch (error) {
        res.error(500, '服务器错误');
    }
};
exports.addDevice = addDevice;
// 更新设备信息
const updateDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const { deviceName, deviceType, status } = req.body;
        // 检查设备是否存在且属于当前用户
        const device = await Device_1.default.findOne({
            where: { id, user_id: req.user.id }
        });
        if (!device) {
            return res.error(404, '设备不存在');
        }
        // 检查状态是否变化
        const statusChanged = status && status !== device.status;
        // 更新设备信息
        await Device_1.default.update({ device_name: deviceName, device_type: deviceType, status }, { where: { id } });
        // 获取更新后的设备信息
        const updatedDevice = await Device_1.default.findByPk(id);
        // 清除设备列表缓存和设备详情缓存
        const cacheKey = `devices:${req.user.id}`;
        const deviceCacheKey = `device:${id}`;
        await redis_1.Cache.del(cacheKey);
        await redis_1.Cache.del(deviceCacheKey);
        // 如果状态变化，通过WebSocket推送更新
        if (statusChanged && updatedDevice) {
            websocketService_1.default.sendDeviceStatusUpdate(req.user.id, parseInt(id), updatedDevice.status);
        }
        res.success({ device: updatedDevice ? (typeof updatedDevice.toJSON === 'function' ? updatedDevice.toJSON() : updatedDevice) : null }, '设备信息更新成功');
    }
    catch (error) {
        res.error(500, '服务器错误');
    }
};
exports.updateDevice = updateDevice;
// 解绑设备
const removeDevice = async (req, res) => {
    try {
        const { id } = req.params;
        // 检查设备是否存在且属于当前用户
        const device = await Device_1.default.findOne({
            where: { id, user_id: req.user.id }
        });
        if (!device) {
            return res.error(404, '设备不存在');
        }
        // 删除设备
        await Device_1.default.destroy({
            where: { id }
        });
        // 清除设备列表缓存和设备详情缓存
        const cacheKey = `devices:${req.user.id}`;
        const deviceCacheKey = `device:${id}`;
        await redis_1.Cache.del(cacheKey);
        await redis_1.Cache.del(deviceCacheKey);
        res.success(null, '设备解绑成功');
    }
    catch (error) {
        res.error(500, '服务器错误');
    }
};
exports.removeDevice = removeDevice;
// 获取单个设备信息
const getDevice = async (req, res) => {
    try {
        const { id } = req.params;
        // 尝试从缓存获取
        const cacheKey = `device:${id}`;
        const cachedDevice = await redis_1.Cache.get(cacheKey);
        if (cachedDevice) {
            return res.success({ device: cachedDevice });
        }
        // 从数据库获取
        const device = await Device_1.default.findOne({
            where: { id, user_id: req.user.id }
        });
        if (!device) {
            return res.error(404, '设备不存在');
        }
        // 转换为普通对象，避免序列化问题
        const deviceJSON = typeof device.toJSON === 'function' ? device.toJSON() : device;
        await redis_1.Cache.set(cacheKey, deviceJSON, 900);
        res.success({ device: deviceJSON });
    }
    catch (error) {
        res.error(500, '服务器错误');
    }
};
exports.getDevice = getDevice;
//# sourceMappingURL=device.js.map