import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/CustomError';

// 全局错误处理中间件
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // 使用类型断言添加自定义方法
  const customRes = res as Response & {
    success: (data?: any, message?: string) => Response;
    created: (data?: any, message?: string) => Response;
    error: (status: number, message?: string, data?: any) => Response;
  };

  // 检查是否为自定义错误
  if (err instanceof CustomError) {
    return customRes.error(err.statusCode, err.message, err.data);
  }

  // 处理其他类型的错误
  console.error('Unexpected error:', err);

  // 默认错误响应
  return customRes.error(500, '服务器内部错误', {
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorHandler;