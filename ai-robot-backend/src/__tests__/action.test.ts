import request from 'supertest';
import express from 'express';
import actionRoutes from '../routes/action';
import authMiddleware from '../middleware/auth';
import responseHandler from '../middleware/responseHandler';
import { initBasicActions } from '../controllers/action';
import Action from '../models/Action';

// 模拟认证中间件
jest.mock('../middleware/auth', () => {
  return (req: any, res: any, next: any) => {
    req.user = { id: 1 };
    next();
  };
});

// 模拟Action模型
jest.mock('../models/Action', () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
  findByPk: jest.fn(),
  bulkCreate: jest.fn(),
}));

// 创建测试服务器
const app = express();
app.use(express.json());
app.use(responseHandler);
app.use('/api/actions', actionRoutes);

describe('Action Routes', () => {
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
  });

  describe('GET /api/actions', () => {
    it('should return all actions', async () => {
      // 模拟数据
      const mockActions = [
        { id: 1, name: '前进', type: 'basic', description: '机器人向前移动', duration: 1, steps: ['前进'], created_at: new Date(), updated_at: new Date() },
        { id: 2, name: '后退', type: 'basic', description: '机器人向后移动', duration: 1, steps: ['后退'], created_at: new Date(), updated_at: new Date() },
      ];
      
      // 模拟Action.findAll
      (Action.findAll as jest.Mock).mockResolvedValue(mockActions);
      
      // 发送请求
      const response = await request(app).get('/api/actions');
      
      // 验证结果
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.data.actions).toHaveLength(2);
      expect(response.body.data.actions[0].id).toBe(1);
      expect(response.body.data.actions[0].name).toBe('前进');
      expect(response.body.data.actions[1].id).toBe(2);
      expect(response.body.data.actions[1].name).toBe('后退');
      expect(Action.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/actions', () => {
    it('should create a new basic action', async () => {
      // 模拟数据
      const mockAction = { id: 3, name: '测试动作', type: 'basic', description: '测试动作描述', duration: 1, steps: ['测试'], created_at: new Date(), updated_at: new Date() };
      
      // 模拟Action.findOne和Action.create
      (Action.findOne as jest.Mock).mockResolvedValue(null);
      (Action.create as jest.Mock).mockResolvedValue(mockAction);
      
      // 发送请求
      const response = await request(app)
        .post('/api/actions')
        .send({
          name: '测试动作',
          description: '测试动作描述',
          type: 'basic',
          duration: 1,
          steps: ['测试']
        });
      
      // 验证结果
      expect(response.status).toBe(201);
      expect(response.body.code).toBe(201);
      expect(response.body.message).toBe('动作创建成功');
      expect(response.body.data.action.id).toBe(3);
      expect(response.body.data.action.name).toBe('测试动作');
      expect(response.body.data.action.type).toBe('basic');
      expect(Action.findOne).toHaveBeenCalledTimes(1);
      expect(Action.create).toHaveBeenCalledTimes(1);
    });

    it('should create a new action combination', async () => {
      // 模拟数据
      const mockAction = { id: 4, name: '测试组合', type: 'combination', description: '测试组合描述', duration: 2, steps: [1, 2], created_at: new Date(), updated_at: new Date() };
      
      // 模拟Action.findOne、Action.findAll和Action.create
      (Action.findOne as jest.Mock).mockResolvedValue(null);
      (Action.findAll as jest.Mock).mockResolvedValue([
        { id: 1, name: '前进', duration: 1 },
        { id: 2, name: '右转', duration: 1 }
      ]);
      (Action.create as jest.Mock).mockResolvedValue(mockAction);
      
      // 发送请求
      const response = await request(app)
        .post('/api/actions')
        .send({
          name: '测试组合',
          description: '测试组合描述',
          type: 'combination',
          duration: 2,
          steps: [1, 2]
        });
      
      // 验证结果
      expect(response.status).toBe(201);
      expect(response.body.code).toBe(201);
      expect(response.body.message).toBe('动作创建成功');
      expect(response.body.data.action.id).toBe(4);
      expect(response.body.data.action.name).toBe('测试组合');
      expect(response.body.data.action.type).toBe('combination');
      expect(Action.findOne).toHaveBeenCalledTimes(1);
      expect(Action.findAll).toHaveBeenCalledTimes(1);
      expect(Action.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/actions/:id', () => {
    it('should return a single action', async () => {
      // 模拟数据
      const mockAction = { id: 1, name: '前进', type: 'basic', description: '机器人向前移动', duration: 1, steps: ['前进'], created_at: new Date(), updated_at: new Date() };
      
      // 模拟Action.findByPk
      (Action.findByPk as jest.Mock).mockResolvedValue(mockAction);
      
      // 发送请求
      const response = await request(app).get('/api/actions/1');
      
      // 验证结果
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.data.action.id).toBe(1);
      expect(response.body.data.action.name).toBe('前进');
      expect(Action.findByPk).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if action not found', async () => {
      // 模拟Action.findByPk返回null
      (Action.findByPk as jest.Mock).mockResolvedValue(null);
      
      // 发送请求
      const response = await request(app).get('/api/actions/999');
      
      // 验证结果
      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.message).toBe('动作不存在');
      expect(Action.findByPk).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /api/actions/:id', () => {
    it('should update an existing action', async () => {
      // 模拟数据
      const mockAction = { id: 1, name: '前进', type: 'basic', description: '机器人向前移动', duration: 1, steps: ['前进'], created_at: new Date(), updated_at: new Date() };
      const updatedAction = { ...mockAction, name: '更新后的前进' };
      
      // 模拟Action.findByPk和Action.update
      (Action.findByPk as jest.Mock).mockResolvedValue(mockAction);
      (Action.update as jest.Mock).mockResolvedValue([1]);
      (Action.findByPk as jest.Mock).mockResolvedValueOnce(mockAction).mockResolvedValueOnce(updatedAction);
      
      // 发送请求
      const response = await request(app)
        .put('/api/actions/1')
        .send({
          name: '更新后的前进',
          description: '机器人向前移动',
          type: 'basic',
          duration: 1,
          steps: ['前进']
        });
      
      // 验证结果
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('动作信息更新成功');
      expect(response.body.data.action.id).toBe(1);
      expect(response.body.data.action.name).toBe('更新后的前进');
      expect(Action.findByPk).toHaveBeenCalledTimes(2);
      expect(Action.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /api/actions/:id', () => {
    it('should delete an existing action', async () => {
      // 模拟数据
      const mockAction = { id: 1, name: '前进', type: 'basic', description: '机器人向前移动', duration: 1, steps: ['前进'], created_at: new Date(), updated_at: new Date() };
      
      // 模拟Action.findByPk、Action.count和Action.destroy
      (Action.findByPk as jest.Mock).mockResolvedValue(mockAction);
      (Action.count as jest.Mock).mockResolvedValue(0);
      (Action.destroy as jest.Mock).mockResolvedValue(1);
      
      // 发送请求
      const response = await request(app).delete('/api/actions/1');
      
      // 验证结果
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('动作删除成功');
      expect(Action.findByPk).toHaveBeenCalledTimes(1);
      expect(Action.count).toHaveBeenCalledTimes(1);
      expect(Action.destroy).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/actions/execute', () => {
    it('should execute an action', async () => {
      // 模拟数据
      const mockAction = { id: 1, name: '前进', type: 'basic', description: '机器人向前移动', duration: 1, steps: ['前进'], created_at: new Date(), updated_at: new Date() };
      
      // 模拟Action.findByPk
      (Action.findByPk as jest.Mock).mockResolvedValue(mockAction);
      
      // 发送请求
      const response = await request(app)
        .post('/api/actions/execute')
        .send({ actionId: 1 });
      
      // 验证结果
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('动作执行成功');
      expect(Action.findByPk).toHaveBeenCalledTimes(1);
    });
  });
});
