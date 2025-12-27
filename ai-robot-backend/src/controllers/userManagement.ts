import { Request, Response } from 'express';
import { Op } from 'sequelize';
import User from '../models/User';
import Role from '../models/Role';
import Permission from '../models/Permission';
import RolePermission from '../models/RolePermission';
import OperationLog from '../models/OperationLog';

// 创建用户管理控制器

// 获取所有用户列表
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Role,
        attributes: ['name', 'description']
      }],
      attributes: { exclude: ['password'] }
    });
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 创建新用户
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, phone, role_id } = req.body;
    
    // 检查用户是否已存在
    const userExists = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email }
        ]
      }
    });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // 创建新用户
    const user = await User.create({ username, email, password, phone, role_id, status: 'active' });
    
    // 记录操作日志
    await OperationLog.create({
      user_id: req.user?.id || 0,
      username: req.user?.username || 'system',
      operation: 'create_user',
      module: 'user_management',
      ip: req.ip || 'unknown',
      user_agent: req.get('User-Agent') || '',
      status: 'success',
      details: `Created user ${username}`
    });
    
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 更新用户信息
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, phone, role_id, status } = req.body;
    
    // 查找用户
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // 更新用户信息
    await user.update({ username, email, phone, role_id, status });
    
    // 记录操作日志
    await OperationLog.create({
      user_id: req.user?.id || 0,
      username: req.user?.username || 'system',
      operation: 'update_user',
      module: 'user_management',
      ip: req.ip || 'unknown',
      user_agent: req.get('User-Agent') || '',
      status: 'success',
      details: `Updated user ${username}`
    });
    
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 禁用用户
export const disableUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // 查找用户
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // 禁用用户
    await user.update({ status: 'disabled' });
    
    // 记录操作日志
    await OperationLog.create({
      user_id: req.user?.id || 0,
      username: req.user?.username || 'system',
      operation: 'disable_user',
      module: 'user_management',
      ip: req.ip || 'unknown',
      user_agent: req.get('User-Agent') || '',
      status: 'success',
      details: `Disabled user ${user.username}`
    });
    
    res.status(200).json({ message: 'User disabled successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 获取所有角色
export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.findAll();
    res.status(200).json(roles);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 创建角色
export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    // 创建角色
    const role = await Role.create({ name, description });
    
    // 记录操作日志
    await OperationLog.create({
      user_id: req.user?.id || 0,
      username: req.user?.username || 'system',
      operation: 'create_role',
      module: 'user_management',
      ip: req.ip || 'unknown',
      user_agent: req.get('User-Agent') || '',
      status: 'success',
      details: `Created role ${name}`
    });
    
    res.status(201).json({ message: 'Role created successfully', role });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 为角色分配权限
export const assignPermissions = async (req: Request, res: Response) => {
  try {
    const { role_id, permission_ids } = req.body;
    
    // 删除该角色已有的权限
    await RolePermission.destroy({ where: { role_id } });
    
    // 为角色分配新的权限
    const rolePermissions = permission_ids.map((permission_id: number) => ({
      role_id,
      permission_id
    }));
    await RolePermission.bulkCreate(rolePermissions);
    
    // 记录操作日志
    await OperationLog.create({
      user_id: req.user?.id || 0,
      username: req.user?.username || 'system',
      operation: 'assign_permissions',
      module: 'user_management',
      ip: req.ip || 'unknown',
      user_agent: req.get('User-Agent') || '',
      status: 'success',
      details: `Assigned permissions to role ${role_id}`
    });
    
    res.status(200).json({ message: 'Permissions assigned successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 获取所有权限
export const getPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await Permission.findAll();
    res.status(200).json(permissions);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 获取操作日志
export const getOperationLogs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const logs = await OperationLog.findAndCountAll({
      limit: Number(limit),
      offset,
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json({
      logs: logs.rows,
      total: logs.count,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};