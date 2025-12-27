import { Request, Response } from 'express';
import { Sequelize, Op } from 'sequelize';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { sendVerificationCode, verifyCode } from '../services/verificationCode';
import { AuthenticatedRequest } from '../middleware/auth';

// 注册用户
export const register = async (req: Request, res: Response) => {
  try {
    console.log('Received registration request:', req.body);
    const { username, email, password } = req.body;
    
    // 检查用户是否已存在
    console.log('Checking if user exists:', username, email);
    const userExists = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email }
        ]
      }
    });
    if (userExists) {
      console.log('User already exists:', username, email);
      return (res as any).error(400, '用户已存在');
    }
    
    // 创建新用户
    console.log('Creating new user:', username, email);
    const user = await User.create({ username, email, password, role_id: 2, status: 'active' });
    console.log('User created successfully:', user.id);
    
    // 生成JWT令牌（简化版本，不使用expiresIn选项）
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'default_secret_key'
    );
    
    (res as any).created({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    }, '用户注册成功');
  } catch (error: any) {
    console.error('Registration error:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'SequelizeValidationError') {
      // 处理验证错误，返回更友好的信息
      const validationErrors = error.errors.map((err: any) => ({
        field: err.path,
        message: err.message
      }));
      (res as any).error(400, '验证错误', { errors: validationErrors });
    } else {
      (res as any).error(500, '服务器错误', { error: error.message });
    }
  }
};

// 登录用户
export const login = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    
    // 构建查询条件，只包含提供的参数
    const whereCondition: any = {};
    if (username) whereCondition.username = username;
    if (email) whereCondition.email = email;
    
    // 检查是否提供了至少一个登录凭证
    if (!username && !email) {
      return (res as any).error(400, '请提供用户名或邮箱');
    }
    
    // 检查用户是否存在
    const user = await User.findOne({
      where: whereCondition
    });
    if (!user) {
      return (res as any).error(400, '用户名/邮箱或密码错误');
    }
    
    // 检查密码是否正确
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return (res as any).error(400, '用户名/邮箱或密码错误');
    }
    
    // 生成JWT令牌（简化版本，不使用expiresIn选项）
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'default_secret_key'
    );
    
    (res as any).success({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    }, '登录成功');
  } catch (error: any) {
    console.error('Login error:', error.message);
    console.error('Error stack:', error.stack);
    (res as any).error(500, '服务器错误', { error: error.message });
  }
};

// 获取当前用户信息
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    (res as any).success({ user: req.user });
  } catch (error) {
    (res as any).error(500, '服务器错误');
  }
};

// 发送验证码
export const sendCode = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return (res as any).error(400, '手机号不能为空');
    }

    // 发送验证码
    await sendVerificationCode(phone);
    (res as any).success(null, '验证码发送成功');
  } catch (error: any) {
    console.error('发送验证码失败:', error.message);
    (res as any).error(400, error.message);
  }
};

// 手机号验证码登录
export const phoneLogin = async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return (res as any).error(400, '手机号和验证码不能为空');
    }

    // 验证验证码
    const isValid = verifyCode(phone, code);
    if (!isValid) {
      return (res as any).error(400, '验证码无效或已过期');
    }

    // 查找用户
    let user = await User.findOne({ where: { phone } });
    
    // 如果用户不存在，自动注册
    if (!user) {
      // 生成默认用户名（使用手机号后6位）
      const defaultUsername = `user_${phone.slice(-6)}`;
      // 使用手机号作为默认邮箱
      const defaultEmail = `${phone}@example.com`;
      // 生成随机密码
      const randomPassword = Math.random().toString(36).slice(-8);
      
      // 创建新用户
      user = await User.create({
        username: defaultUsername,
        email: defaultEmail,
        phone,
        password: randomPassword,
        role_id: 2,
        status: 'active'
      });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'default_secret_key'
    );

    (res as any).success({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone
      }
    }, '登录成功');
  } catch (error: any) {
    console.error('手机号登录失败:', error.message);
    console.error('错误栈:', error.stack);
    (res as any).error(500, '服务器错误', { error: error.message });
  }
};
