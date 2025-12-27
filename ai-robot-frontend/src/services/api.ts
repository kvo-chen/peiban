import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

import type { LoginRequest, RegisterRequest, ChatRequest, PhoneLoginRequest, SendCodeRequest } from '../types';

// 创建Axios实例
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3002/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器，用于添加认证令牌
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器，用于处理错误
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // 如果是401错误，清除本地存储的令牌并跳转到登录页面
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authApi = {
  // 登录
  login: async (data: LoginRequest) => {
    const response = await api.post('/auth/login', data);
    // 保存令牌和用户信息到本地存储
    if (response.data.data && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      // 触发登录事件，通知WebSocket服务建立连接
      window.dispatchEvent(new Event('login'));
    }
    return response.data.data;
  },
  
  // 注册
  register: async (data: RegisterRequest) => {
    const response = await api.post('/auth/register', data);
    // 保存令牌和用户信息到本地存储
    if (response.data.data && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      // 触发登录事件，通知WebSocket服务建立连接
      window.dispatchEvent(new Event('login'));
    }
    return response.data.data;
  },
  
  // 获取当前用户信息
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },
  
  // 登出
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // 触发登出事件，通知WebSocket服务关闭连接
    window.dispatchEvent(new Event('logout'));
    window.location.href = '/login';
  },
  
  // 发送验证码
  sendCode: async (data: SendCodeRequest) => {
    const response = await api.post('/auth/send-code', data);
    return response.data.data;
  },
  
  // 手机号验证码登录
  phoneLogin: async (data: PhoneLoginRequest) => {
    const response = await api.post('/auth/phone-login', data);
    // 保存令牌和用户信息到本地存储
    if (response.data.data && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      // 触发登录事件，通知WebSocket服务建立连接
      window.dispatchEvent(new Event('login'));
    }
    return response.data.data;
  },
};

// 设备相关API
export const deviceApi = {
  // 获取设备列表
  getDevices: async (params?: { search?: string; status?: string; deviceType?: string; page?: number; limit?: number }) => {
    const response = await api.get('/devices', { params });
    // 转换后端返回的蛇形命名法为前端使用的驼峰命名法
    const devices = response.data.data.devices.map((device: any) => ({
      id: device.id,
      deviceName: device.device_name,
      deviceType: device.device_type,
      status: device.status,
      createdAt: device.created_at,
      updatedAt: device.updated_at
    }));
    return {
      devices,
      total: response.data.data.total,
      page: response.data.data.page,
      limit: response.data.data.limit
    };
  },
  
  // 添加设备
  addDevice: async (data: { deviceName: string; deviceType: string }) => {
    // 转换前端的驼峰命名法为后端使用的蛇形命名法
    const requestData = {
      device_name: data.deviceName,
      device_type: data.deviceType
    };
    const response = await api.post('/devices', requestData);
    return response.data;
  },
  
  // 获取单个设备
  getDevice: async (id: string) => {
    const response = await api.get(`/devices/${id}`);
    // 转换后端返回的蛇形命名法为前端使用的驼峰命名法
    const device = response.data.data.device;
    return {
      device: {
        id: device.id,
        deviceName: device.device_name,
        deviceType: device.device_type,
        status: device.status,
        createdAt: device.created_at,
        updatedAt: device.updated_at
      }
    };
  },
  
  // 更新设备
  updateDevice: async (id: string, data: { deviceName?: string; deviceType?: string; status?: 'online' | 'offline' }) => {
    // 转换前端的驼峰命名法为后端使用的蛇形命名法
    const requestData = {
      device_name: data.deviceName,
      device_type: data.deviceType,
      status: data.status
    };
    const response = await api.put(`/devices/${id}`, requestData);
    return response.data;
  },
  
  // 删除设备
  deleteDevice: async (id: string) => {
    const response = await api.delete(`/devices/${id}`);
    return response.data;
  },
  
  // 批量删除设备
  batchDeleteDevices: async (deviceIds: number[]) => {
    const response = await api.post('/devices/batch-delete', { deviceIds });
    return response.data;
  },
  
  // 批量更新设备状态
  batchUpdateDevicesStatus: async (deviceIds: number[], status: 'online' | 'offline') => {
    const response = await api.post('/devices/batch-update-status', { deviceIds, status });
    return response.data;
  },
};

// 动作相关API
export const actionApi = {
  // 获取动作列表
  getActions: async () => {
    const response = await api.get('/actions');
    return response.data.data;
  },
  
  // 创建动作
  createAction: async (data: { name: string; description: string; type: 'basic' | 'custom'; duration: number; steps: string[] }) => {
    const response = await api.post('/actions', data);
    return response.data;
  },
  
  // 获取单个动作
  getAction: async (id: string) => {
    const response = await api.get(`/actions/${id}`);
    return response.data;
  },
  
  // 更新动作
  updateAction: async (id: string, data: { name?: string; description?: string; type?: 'basic' | 'custom'; duration?: number; steps?: string[] }) => {
    const response = await api.put(`/actions/${id}`, data);
    return response.data;
  },
  
  // 删除动作
  deleteAction: async (id: string) => {
    const response = await api.delete(`/actions/${id}`);
    return response.data;
  },
};

// 设备动作映射相关API
export const deviceActionApi = {
  // 获取设备的动作映射列表
  getDeviceActions: async (deviceId: string) => {
    const response = await api.get(`/device-actions/${deviceId}`);
    return response.data.data;
  },
  
  // 添加设备动作映射
  addDeviceAction: async (data: { deviceId: string; actionId: string; prompt: string }) => {
    const response = await api.post('/device-actions', data);
    return response.data;
  },
  
  // 更新设备动作映射
  updateDeviceAction: async (id: string, data: { prompt: string }) => {
    const response = await api.put(`/device-actions/${id}`, data);
    return response.data;
  },
  
  // 删除设备动作映射
  deleteDeviceAction: async (id: string) => {
    const response = await api.delete(`/device-actions/${id}`);
    return response.data;
  },
};

// 对话相关API
export const chatApi = {
  // 发送消息
  sendMessage: async (data: ChatRequest) => {
    const response = await api.post('/chat', data);
    return response.data.data;
  },
  
  // 获取对话历史
  getChatHistory: async (deviceId: string, limit?: number) => {
    const response = await api.get(`/chat/${deviceId}`, { params: { limit } });
    return response.data.data;
  },
};

// 设备分组相关API
export const deviceGroupApi = {
  // 获取设备分组列表
  getDeviceGroups: async () => {
    const response = await api.get('/device-groups');
    return response.data.data;
  },
  
  // 创建设备分组
  createDeviceGroup: async (data: { name: string; description: string }) => {
    const response = await api.post('/device-groups', data);
    return response.data;
  },
  
  // 获取单个设备分组
  getDeviceGroup: async (id: string) => {
    const response = await api.get(`/device-groups/${id}`);
    return response.data;
  },
  
  // 更新设备分组
  updateDeviceGroup: async (id: string, data: { name: string; description: string }) => {
    const response = await api.put(`/device-groups/${id}`, data);
    return response.data;
  },
  
  // 删除设备分组
  deleteDeviceGroup: async (id: string) => {
    const response = await api.delete(`/device-groups/${id}`);
    return response.data;
  },
  
  // 向设备分组添加设备
  addDeviceToGroup: async (data: { groupId: string; deviceId: string }) => {
    const response = await api.post('/device-groups/add-device', data);
    return response.data;
  },
  
  // 从设备分组移除设备
  removeDeviceFromGroup: async (data: { groupId: string; deviceId: string }) => {
    const response = await api.post('/device-groups/remove-device', data);
    return response.data;
  },
};

// 数据分析相关API
export const analyticsApi = {
  // 获取设备使用统计
  getDeviceUsageStats: async (params?: { startDate?: string; endDate?: string; deviceId?: string }) => {
    const response = await api.get('/analytics/device-usage', { params });
    return response.data.data;
  },
  
  // 获取动作使用统计
  getActionUsageStats: async (params?: { startDate?: string; endDate?: string; deviceId?: string }) => {
    const response = await api.get('/analytics/action-usage', { params });
    return response.data.data;
  },
  
  // 获取对话趋势
  getConversationTrend: async (params?: { startDate?: string; endDate?: string; interval?: string }) => {
    const response = await api.get('/analytics/conversation-trend', { params });
    return response.data.data;
  },
  
  // 获取设备激活率
  getDeviceActivationRate: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/analytics/device-activation-rate', { params });
    return response.data.data;
  },
  
  // 获取AI响应统计
  getAIResponseStats: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/analytics/ai-response-stats', { params });
    return response.data.data;
  },
  
  // 获取综合分析
  getComprehensiveAnalysis: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/analytics/comprehensive', { params });
    return response.data.data;
  },
};

// 日志相关API
export const logApi = {
  // 获取操作日志
  getOperationLogs: async (page: number = 1, limit: number = 10) => {
    const response = await api.get('/admin/logs', { params: { page, limit } });
    return response.data.data;
  },
};

export default api;
