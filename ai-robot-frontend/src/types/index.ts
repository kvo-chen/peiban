// 用户类型
export interface User {
  id: string;
  username: string;
  email: string;
}

// 设备类型
export interface Device {
  _id: string;
  userId: string;
  deviceName: string;
  deviceType: string;
  status: 'online' | 'offline';
  createdAt: Date;
}

// 动作类型
export interface Action {
  _id: string;
  name: string;
  description: string;
  type: 'basic' | 'custom';
  duration: number;
  steps: string[];
  createdAt: Date;
}

// 设备动作映射类型
export interface DeviceAction {
  _id: string;
  deviceId: string;
  actionId: Action;
  prompt: string;
  createdAt: Date;
}

// 对话记录类型
export interface Conversation {
  _id: string;
  userId: string;
  deviceId: string;
  message: string;
  response: string;
  actionTriggered: string | null;
  createdAt: Date;
}

// 登录请求类型
export interface LoginRequest {
  email: string;
  password: string;
}

// 注册请求类型
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// AI对话请求类型
export interface ChatRequest {
  deviceId: string;
  message: string;
}

// API响应类型
export interface ApiResponse<T> {
  message: string;
  [key: string]: any;
  data?: T;
}
