import { Request, Response, NextFunction } from 'express';

// 统一响应格式中间件
const responseHandler = (req: Request, res: Response, next: NextFunction) => {
  // 使用类型断言添加自定义方法
  const customRes = res as Response & {
    success: (data?: any, message?: string) => Response;
    created: (data?: any, message?: string) => Response;
    error: (status: number, message?: string, data?: any) => Response;
  };

  // 成功响应方法
  customRes.success = (data?: any, message: string = '操作成功') => {
    return customRes.status(200).json({
      code: 200,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  };

  // 成功创建响应方法（用于POST请求）
  customRes.created = (data?: any, message: string = '创建成功') => {
    return customRes.status(201).json({
      code: 201,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  };

  // 错误响应方法
  customRes.error = (status: number, message: string = '操作失败', data?: any) => {
    return customRes.status(status).json({
      code: status,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  };

  // 将自定义方法复制到原始响应对象
  Object.assign(res, customRes);

  next();
};

export default responseHandler;
