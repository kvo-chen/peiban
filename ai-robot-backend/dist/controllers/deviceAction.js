"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDeviceAction = exports.updateDeviceAction = exports.addDeviceAction = exports.getDeviceActions = void 0;
const DeviceAction_1 = __importDefault(require("../models/DeviceAction"));
const Action_1 = __importDefault(require("../models/Action"));
// 获取设备的动作列表
const getDeviceActions = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const deviceActions = await DeviceAction_1.default.findAll({
            where: { device_id: deviceId },
            include: [{ model: Action_1.default }]
        });
        res.success({ deviceActions });
    }
    catch (error) {
        res.error(500, '服务器错误');
    }
};
exports.getDeviceActions = getDeviceActions;
// 为设备添加动作映射
const addDeviceAction = async (req, res) => {
    try {
        const { deviceId, actionId, prompt } = req.body;
        // 检查设备动作映射是否已存在
        const deviceActionExists = await DeviceAction_1.default.findOne({
            where: { device_id: deviceId, action_id: actionId }
        });
        if (deviceActionExists) {
            return res.error(400, '设备动作映射已存在');
        }
        // 创建新的设备动作映射
        const deviceAction = await DeviceAction_1.default.create({
            device_id: deviceId,
            action_id: actionId,
            prompt
        });
        res.created({ deviceAction }, '设备动作映射添加成功');
    }
    catch (error) {
        res.error(500, '服务器错误');
    }
};
exports.addDeviceAction = addDeviceAction;
// 更新设备动作映射
const updateDeviceAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { prompt } = req.body;
        // 检查设备动作映射是否存在
        const deviceAction = await DeviceAction_1.default.findByPk(id);
        if (!deviceAction) {
            return res.error(404, '设备动作映射不存在');
        }
        // 更新设备动作映射
        await DeviceAction_1.default.update({ prompt }, { where: { id } });
        // 获取更新后的设备动作映射
        const updatedDeviceAction = await DeviceAction_1.default.findByPk(id);
        res.success({ deviceAction: updatedDeviceAction }, '设备动作映射更新成功');
    }
    catch (error) {
        res.error(500, '服务器错误');
    }
};
exports.updateDeviceAction = updateDeviceAction;
// 删除设备动作映射
const deleteDeviceAction = async (req, res) => {
    try {
        const { id } = req.params;
        // 检查设备动作映射是否存在
        const deviceAction = await DeviceAction_1.default.findByPk(id);
        if (!deviceAction) {
            return res.error(404, '设备动作映射不存在');
        }
        // 删除设备动作映射
        await DeviceAction_1.default.destroy({
            where: { id }
        });
        res.success(null, '设备动作映射删除成功');
    }
    catch (error) {
        res.error(500, '服务器错误');
    }
};
exports.deleteDeviceAction = deleteDeviceAction;
//# sourceMappingURL=deviceAction.js.map