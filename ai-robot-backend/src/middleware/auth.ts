import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

const auth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // 从请求头获取token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return (res as any).error(401, '未提供认证令牌，访问被拒绝');
    }
    
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    
    // 查找用户
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return (res as any).error(401, '用户不存在，访问被拒绝');
    }
    
    // 检查用户状态
    if ((user as any).status !== 'active') {
      return (res as any).error(403, '用户账号已禁用，无法访问');
    }
    
    // 将用户信息添加到请求对象
    req.user = user;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return (res as any).error(401, '无效的认证令牌，访问被拒绝');
    }
    if (error instanceof jwt.TokenExpiredError) {
      return (res as any).error(401, '认证令牌已过期，请重新登录');
    }
    return (res as any).error(401, '认证失败，访问被拒绝');
  }
};

export default auth;
