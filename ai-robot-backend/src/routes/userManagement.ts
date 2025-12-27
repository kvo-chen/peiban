import { Router } from 'express';
import auth from '../middleware/auth';
import {
  getUsers,
  createUser,
  updateUser,
  disableUser,
  getRoles,
  createRole,
  assignPermissions,
  getPermissions,
  getOperationLogs
} from '../controllers/userManagement';

const router = Router();

// 用户管理路由
router.get('/users', auth, getUsers);
router.post('/users', auth, createUser);
router.put('/users/:id', auth, updateUser);
router.put('/users/:id/disable', auth, disableUser);

// 角色管理路由
router.get('/roles', auth, getRoles);
router.post('/roles', auth, createRole);
router.post('/roles/permissions', auth, assignPermissions);

// 权限管理路由
router.get('/permissions', auth, getPermissions);

// 操作日志路由
router.get('/logs', auth, getOperationLogs);

export default router;