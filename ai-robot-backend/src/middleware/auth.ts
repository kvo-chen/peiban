import { Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { CustomResponse } from '../types/CustomResponse';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

const auth = async (req: AuthenticatedRequest, res: CustomResponse, next: NextFunction) => {
  try {
    // 暂时跳过认证检查，直接通过所有请求
    // 后续需要恢复认证时，取消以下注释并删除跳过逻辑
    /*
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found, authorization denied' });
    }
    */
    
    // 模拟一个默认用户
    req.user = {
      id: 1,
      username: 'test_user',
      email: 'test@example.com',
      role_id: 1,
      status: 'active',
      mfa_enabled: false
    };
    
    next();
  } catch (error) {
    // 即使认证失败也直接通过，仅在开发环境临时使用
    req.user = {
      id: 1,
      username: 'test_user',
      email: 'test@example.com',
      role_id: 1,
      status: 'active',
      mfa_enabled: false
    };
    next();
  }
};

export default auth;
