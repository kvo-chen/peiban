import 'express';

// 扩展Express Response接口，添加自定义响应方法
declare module 'express-serve-static-core' {
  interface Response {
    // 成功响应方法
    success: (data?: any, message?: string) => this;
    
    // 成功创建响应方法（用于POST请求）
    created: (data?: any, message?: string) => this;
    
    // 错误响应方法
    error: (status: number, message?: string, data?: any) => this;
  }
}
