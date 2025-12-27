import rateLimit from 'express-rate-limit';

// 通用API限流配置
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP在15分钟内最多请求100次
  standardHeaders: true, // 返回限流信息在响应头中
  legacyHeaders: false, // 禁用X-RateLimit-*头
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试',
    timestamp: new Date().toISOString()
  },
  skipSuccessfulRequests: false, // 对所有请求都限流，包括成功的请求
});

// 认证相关路由限流配置（更严格）
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 20, // 每个IP在15分钟内最多请求20次
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    message: '认证请求过于频繁，请稍后再试',
    timestamp: new Date().toISOString()
  },
});

// 设备管理相关路由限流配置
export const deviceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 50, // 每个IP在15分钟内最多请求50次
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    message: '设备管理请求过于频繁，请稍后再试',
    timestamp: new Date().toISOString()
  },
});

// 聊天相关路由限流配置
export const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP在15分钟内最多请求100次
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    message: '聊天请求过于频繁，请稍后再试',
    timestamp: new Date().toISOString()
  },
});
