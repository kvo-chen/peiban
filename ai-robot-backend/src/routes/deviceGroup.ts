import express from 'express';
import {
  getDeviceGroups,
  createDeviceGroup,
  updateDeviceGroup,
  deleteDeviceGroup,
  getDeviceGroup,
  addDeviceToGroup,
  removeDeviceFromGroup
} from '../controllers/deviceGroup';
import auth from '../middleware/auth';

const router = express.Router();

// 获取设备分组列表
router.get('/', auth, getDeviceGroups);

// 创建新设备分组
router.post('/', auth, createDeviceGroup);

// 获取单个设备分组信息
router.get('/:id', auth, getDeviceGroup);

// 更新设备分组信息
router.put('/:id', auth, updateDeviceGroup);

// 删除设备分组
router.delete('/:id', auth, deleteDeviceGroup);

// 向设备分组添加设备
router.post('/add-device', auth, addDeviceToGroup);

// 从设备分组移除设备
router.post('/remove-device', auth, removeDeviceFromGroup);

export default router;
