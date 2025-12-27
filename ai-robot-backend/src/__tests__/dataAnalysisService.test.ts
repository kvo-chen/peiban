import DataAnalysisService from '../services/dataAnalysisService';
import Conversation from '../models/Conversation';
import Device from '../models/Device';
import Action from '../models/Action';
import { Cache } from '../config/redis';

// 模拟模型
jest.mock('../models/Conversation', () => ({
  count: jest.fn(),
  findAll: jest.fn(),
}));

jest.mock('../models/Device', () => ({
  findAll: jest.fn(),
  count: jest.fn(),
}));

jest.mock('../models/Action', () => ({
  findAll: jest.fn(),
}));

// 模拟缓存服务
jest.mock('../config/redis', () => ({
  Cache: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    delBatch: jest.fn(),
    delPattern: jest.fn(),
    exists: jest.fn(),
    hget: jest.fn(),
    hset: jest.fn(),
    ttl: jest.fn(),
  }
}));

describe('DataAnalysisService', () => {
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
  });

  describe('getDeviceUsageStats', () => {
    it('should return device usage stats from database and cache them', async () => {
      const userId = 1;
      const days = 30;
      
      // 模拟数据
      const mockDevices = [
        {
          id: 1,
          device_name: '智能音箱',
          device_type: 'speaker',
          status: 'online',
          toJSON: jest.fn().mockReturnValue({
            id: 1,
            device_name: '智能音箱',
            device_type: 'speaker',
            status: 'online',
            conversationCount: '5',
            actionTriggeredCount: '3',
            boundActionsCount: '2'
          })
        }
      ];
      
      // 模拟Cache.get返回null（缓存未命中）
      (Cache.get as jest.Mock).mockResolvedValue(null);
      
      // 模拟Device.findAll
      (Device.findAll as jest.Mock).mockResolvedValue(mockDevices);
      
      // 调用服务方法
      const result = await DataAnalysisService.getDeviceUsageStats(userId, days);
      
      // 验证结果
      expect(result).toEqual([{
        deviceId: 1,
        deviceName: '智能音箱',
        deviceType: 'speaker',
        status: 'online',
        conversationCount: 5,
        actionTriggeredCount: 3,
        boundActionsCount: 2
      }]);
      
      // 验证方法调用
      expect(Cache.get).toHaveBeenCalledWith(`deviceUsageStats:${userId}:${days}`);
      expect(Device.findAll).toHaveBeenCalled();
      expect(Cache.set).toHaveBeenCalledWith(
        `deviceUsageStats:${userId}:${days}`,
        expect.any(Array),
        600
      );
    });

    it('should return device usage stats from cache when available', async () => {
      const userId = 1;
      const days = 30;
      
      // 模拟缓存数据
      const cachedStats = [{
        deviceId: 1,
        deviceName: '智能音箱',
        deviceType: 'speaker',
        status: 'online',
        conversationCount: 5,
        actionTriggeredCount: 3,
        boundActionsCount: 2
      }];
      
      // 模拟Cache.get返回缓存数据
      (Cache.get as jest.Mock).mockResolvedValue(cachedStats);
      
      // 调用服务方法
      const result = await DataAnalysisService.getDeviceUsageStats(userId, days);
      
      // 验证结果
      expect(result).toEqual(cachedStats);
      
      // 验证方法调用
      expect(Cache.get).toHaveBeenCalledWith(`deviceUsageStats:${userId}:${days}`);
      expect(Device.findAll).not.toHaveBeenCalled();
      expect(Cache.set).not.toHaveBeenCalled();
    });
  });

  describe('getActionUsageStats', () => {
    it('should return action usage stats from database and cache them', async () => {
      const userId = 1;
      const days = 30;
      
      // 模拟数据
      const mockActions = [
        {
          id: 1,
          name: '前进',
          type: 'basic',
          duration: 1,
          toJSON: jest.fn().mockReturnValue({
            id: 1,
            name: '前进',
            type: 'basic',
            duration: 1,
            usageCount: '10'
          })
        }
      ];
      
      // 模拟Cache.get返回null（缓存未命中）
      (Cache.get as jest.Mock).mockResolvedValue(null);
      
      // 模拟Action.findAll
      (Action.findAll as jest.Mock).mockResolvedValue(mockActions);
      
      // 调用服务方法
      const result = await DataAnalysisService.getActionUsageStats(userId, days);
      
      // 验证结果
      expect(result).toEqual([{
        actionId: 1,
        actionName: '前进',
        actionType: 'basic',
        usageCount: 10,
        duration: 1
      }]);
      
      // 验证方法调用
      expect(Cache.get).toHaveBeenCalledWith(`actionUsageStats:${userId}:${days}`);
      expect(Action.findAll).toHaveBeenCalled();
      expect(Cache.set).toHaveBeenCalledWith(
        `actionUsageStats:${userId}:${days}`,
        expect.any(Array),
        600
      );
    });
  });

  describe('getConversationTrend', () => {
    it('should return conversation trend from database and cache them', async () => {
      const userId = 1;
      const days = 7;
      
      // 模拟数据
      const mockConversations = [
        {
          toJSON: jest.fn().mockReturnValue({
            date: '2023-01-01',
            count: '5'
          })
        },
        {
          toJSON: jest.fn().mockReturnValue({
            date: '2023-01-02',
            count: '3'
          })
        }
      ];
      
      // 模拟Cache.get返回null（缓存未命中）
      (Cache.get as jest.Mock).mockResolvedValue(null);
      
      // 模拟Conversation.findAll
      (Conversation.findAll as jest.Mock).mockResolvedValue(mockConversations);
      
      // 调用服务方法
      const result = await DataAnalysisService.getConversationTrend(userId, days);
      
      // 验证结果（应该返回7天的数据，包括没有对话的日期）
      expect(result).toHaveLength(7);
      
      // 验证方法调用
      expect(Cache.get).toHaveBeenCalledWith(`conversationTrend:${userId}:${days}`);
      expect(Conversation.findAll).toHaveBeenCalled();
      expect(Cache.set).toHaveBeenCalledWith(
        `conversationTrend:${userId}:${days}`,
        expect.any(Array),
        600
      );
    });
  });

  describe('getDeviceActivationRate', () => {
    it('should return device activation rate from database and cache it', async () => {
      const userId = 1;
      const days = 30;
      
      // 模拟数据
      const totalDevices = 5;
      const activeDevices = 3;
      
      // 模拟Cache.get返回null（缓存未命中）
      (Cache.get as jest.Mock).mockResolvedValue(null);
      
      // 模拟Device.count
      (Device.count as jest.Mock).mockResolvedValueOnce(totalDevices).mockResolvedValueOnce(activeDevices);
      
      // 调用服务方法
      const result = await DataAnalysisService.getDeviceActivationRate(userId, days);
      
      // 验证结果
      expect(result).toEqual({
        totalDevices: 5,
        activeDevices: 3,
        activationRate: 60
      });
      
      // 验证方法调用
      expect(Cache.get).toHaveBeenCalledWith(`deviceActivationRate:${userId}:${days}`);
      expect(Device.count).toHaveBeenCalledTimes(2);
      expect(Cache.set).toHaveBeenCalledWith(
        `deviceActivationRate:${userId}:${days}`,
        expect.any(Object),
        600
      );
    });
  });

  describe('getAIResponseStats', () => {
    it('should return AI response stats from database and cache it', async () => {
      const userId = 1;
      const days = 30;
      
      // 模拟数据
      const totalConversations = 100;
      const actionTriggeredConversations = 75;
      
      // 模拟Cache.get返回null（缓存未命中）
      (Cache.get as jest.Mock).mockResolvedValue(null);
      
      // 模拟Conversation.count
      (Conversation.count as jest.Mock).mockResolvedValueOnce(totalConversations).mockResolvedValueOnce(actionTriggeredConversations);
      
      // 调用服务方法
      const result = await DataAnalysisService.getAIResponseStats(userId, days);
      
      // 验证结果
      expect(result).toEqual({
        totalConversations: 100,
        actionTriggeredConversations: 75,
        actionTriggerRate: 75
      });
      
      // 验证方法调用
      expect(Cache.get).toHaveBeenCalledWith(`aiResponseStats:${userId}:${days}`);
      expect(Conversation.count).toHaveBeenCalledTimes(2);
      expect(Cache.set).toHaveBeenCalledWith(
        `aiResponseStats:${userId}:${days}`,
        expect.any(Object),
        600
      );
    });
  });
});
