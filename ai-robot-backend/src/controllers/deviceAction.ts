import { Response } from 'express';
import DeviceAction from '../models/DeviceAction';
import Action from '../models/Action';
import { AuthenticatedRequest } from '../middleware/auth';

// 获取设备的动作列表
export const getDeviceActions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deviceId } = req.params;
    const deviceActions = await DeviceAction.findAll({
      where: { device_id: deviceId },
      include: [{ model: Action }]
    });
    (res as any).success({ deviceActions });
  } catch (error) {
    (res as any).error(500, '服务器错误');
  }
};

// 为设备添加动作映射
export const addDeviceAction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deviceId, actionId, prompt } = req.body;
    
    // 检查设备动作映射是否已存在
    const deviceActionExists = await DeviceAction.findOne({
      where: { device_id: deviceId, action_id: actionId }
    });
    if (deviceActionExists) {
      return (res as any).error(400, '设备动作映射已存在');
    }
    
    // 创建新的设备动作映射
    const deviceAction = await DeviceAction.create({
      device_id: deviceId,
      action_id: actionId,
      prompt
    });
    
    (res as any).created({ deviceAction }, '设备动作映射添加成功');
  } catch (error) {
    (res as any).error(500, '服务器错误');
  }
};

// 更新设备动作映射
export const updateDeviceAction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { prompt } = req.body;
    
    // 检查设备动作映射是否存在
    const deviceAction = await DeviceAction.findByPk(id);
    if (!deviceAction) {
      return (res as any).error(404, '设备动作映射不存在');
    }
    
    // 更新设备动作映射
    await DeviceAction.update(
      { prompt },
      { where: { id } }
    );
    
    // 获取更新后的设备动作映射
    const updatedDeviceAction = await DeviceAction.findByPk(id);
    
    (res as any).success({ deviceAction: updatedDeviceAction }, '设备动作映射更新成功');
  } catch (error) {
    (res as any).error(500, '服务器错误');
  }
};

// 删除设备动作映射
export const deleteDeviceAction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // 检查设备动作映射是否存在
    const deviceAction = await DeviceAction.findByPk(id);
    if (!deviceAction) {
      return (res as any).error(404, '设备动作映射不存在');
    }
    
    // 删除设备动作映射
    await DeviceAction.destroy({
      where: { id }
    });
    
    (res as any).success(null, '设备动作映射删除成功');
  } catch (error) {
    (res as any).error(500, '服务器错误');
  }
};
