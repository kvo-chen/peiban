import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import DeviceGroup from '../models/DeviceGroup';
import DeviceGroupRelation from '../models/DeviceGroupRelation';
import Device from '../models/Device';

// 获取用户的设备分组列表
export const getDeviceGroups = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deviceGroups = await DeviceGroup.findAll({
      where: { user_id: req.user.id }
    });
    (res as any).success({ deviceGroups });
  } catch (error) {
    (res as any).error(500, '服务器错误');
  }
};

// 创建新设备分组
export const createDeviceGroup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    
    // 创建新设备分组
    const deviceGroup = await DeviceGroup.create({
      user_id: req.user.id,
      name,
      description
    });
    
    (res as any).created({ deviceGroup }, '设备分组创建成功');
  } catch (error) {
    (res as any).error(500, error instanceof Error ? error.message : '服务器错误');
  }
};

// 更新设备分组信息
export const updateDeviceGroup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // 检查设备分组是否存在且属于当前用户
    const deviceGroup = await DeviceGroup.findOne({
      where: { id, user_id: req.user.id }
    });
    if (!deviceGroup) {
      return (res as any).error(404, '设备分组不存在');
    }
    
    // 更新设备分组信息
    await DeviceGroup.update(
      { name, description },
      { where: { id } }
    );
    
    // 获取更新后的设备分组信息
    const updatedDeviceGroup = await DeviceGroup.findByPk(id);
    
    (res as any).success({ deviceGroup: updatedDeviceGroup }, '设备分组更新成功');
  } catch (error) {
    (res as any).error(500, error instanceof Error ? error.message : '服务器错误');
  }
};

// 删除设备分组
export const deleteDeviceGroup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // 检查设备分组是否存在且属于当前用户
    const deviceGroup = await DeviceGroup.findOne({
      where: { id, user_id: req.user.id }
    });
    if (!deviceGroup) {
      return (res as any).error(404, '设备分组不存在');
    }
    
    // 删除设备分组（会自动删除关联的设备分组关系）
    await DeviceGroup.destroy({
      where: { id }
    });
    
    (res as any).success(null, '设备分组删除成功');
  } catch (error) {
    (res as any).error(500, '服务器错误');
  }
};

// 获取单个设备分组信息
export const getDeviceGroup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // 检查设备分组是否存在且属于当前用户
    const deviceGroup = await DeviceGroup.findOne({
      where: { id, user_id: req.user.id },
      include: [{ model: Device, as: 'devices' }]
    });
    if (!deviceGroup) {
      return (res as any).error(404, '设备分组不存在');
    }
    
    (res as any).success({ deviceGroup });
  } catch (error) {
    (res as any).error(500, '服务器错误');
  }
};

// 向设备分组添加设备
export const addDeviceToGroup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { groupId, deviceId } = req.body;
    
    // 检查设备分组是否存在且属于当前用户
    const deviceGroup = await DeviceGroup.findOne({
      where: { id: groupId, user_id: req.user.id }
    });
    if (!deviceGroup) {
      return (res as any).error(404, '设备分组不存在');
    }
    
    // 检查设备是否存在且属于当前用户
    const device = await Device.findOne({
      where: { id: deviceId, user_id: req.user.id }
    });
    if (!device) {
      return (res as any).error(404, '设备不存在');
    }
    
    // 检查设备是否已在分组中
    const existingRelation = await DeviceGroupRelation.findOne({
      where: { device_id: deviceId, group_id: groupId }
    });
    if (existingRelation) {
      return (res as any).error(400, '设备已在分组中');
    }
    
    // 添加设备到分组
    await DeviceGroupRelation.create({
      device_id: deviceId,
      group_id: groupId
    });
    
    (res as any).success(null, '设备添加到分组成功');
  } catch (error) {
    (res as any).error(500, '服务器错误');
  }
};

// 从设备分组移除设备
export const removeDeviceFromGroup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { groupId, deviceId } = req.body;
    
    // 检查设备分组是否存在且属于当前用户
    const deviceGroup = await DeviceGroup.findOne({
      where: { id: groupId, user_id: req.user.id }
    });
    if (!deviceGroup) {
      return (res as any).error(404, '设备分组不存在');
    }
    
    // 检查设备分组关系是否存在
    const relation = await DeviceGroupRelation.findOne({
      where: { device_id: deviceId, group_id: groupId }
    });
    if (!relation) {
      return (res as any).error(404, '设备不在分组中');
    }
    
    // 从设备分组移除设备
    await relation.destroy();
    
    (res as any).success(null, '设备从分组移除成功');
  } catch (error) {
    (res as any).error(500, '服务器错误');
  }
};
