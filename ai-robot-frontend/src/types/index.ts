// 用户类型
export interface User {
  id: number;
  username: string;
  email: string;
}

// WebSocket事件类型
export interface WebSocketEvent {
  type: string;
  data: any;
}

// 设备状态更新事件
export interface DeviceStatusUpdate {
  deviceId: number;
  status: 'online' | 'offline';
  timestamp: string;
}

// 聊天消息事件
export interface ChatMessageEvent {
  conversation: any;
  timestamp: string;
}

// 设备类型
export interface Device {
  id: number;
  userId: number;
  deviceName: string;
  deviceType: string;
  status: 'online' | 'offline';
  createdAt: Date;
}

// 动作类型
export interface Action {
  id: number;
  name: string;
  description: string;
  type: 'basic' | 'custom';
  duration: number;
  steps: string[];
  createdAt: Date;
}

// 设备动作映射类型
export interface DeviceAction {
  id: number;
  deviceId: number;
  actionId: Action;
  prompt: string;
  createdAt: Date;
}

// 对话记录类型
export interface Conversation {
  id: number;
  userId: number;
  deviceId: number;
  message: string;
  response: string;
  actionTriggered: string | null;
  createdAt: Date;
}

// 设备分组类型
export interface DeviceGroup {
  id: number;
  userId: number;
  name: string;
  description: string;
  devices: Device[];
  createdAt: Date;
}

// 登录请求类型
export interface LoginRequest {
  email: string;
  password: string;
}

// 手机号登录请求类型
export interface PhoneLoginRequest {
  phone: string;
  code: string;
}

// 发送验证码请求类型
export interface SendCodeRequest {
  phone: string;
}

// 注册请求类型
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
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
