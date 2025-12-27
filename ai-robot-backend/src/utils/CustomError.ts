// 自定义错误类，用于统一错误处理
export class CustomError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
    this.data = data;
    
    // 维护原型链
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}