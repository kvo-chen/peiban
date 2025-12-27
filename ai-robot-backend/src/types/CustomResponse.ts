import { Response as ExpressResponse } from 'express';

// 自定义响应类型，包含自定义方法
export interface CustomResponse extends ExpressResponse {
  success: (data?: any, message?: string) => this;
  created: (data?: any, message?: string) => this;
  error: (status: number, message?: string, data?: any) => this;
}