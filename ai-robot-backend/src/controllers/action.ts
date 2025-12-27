import { Response } from 'express';
import Action from '../models/Action';
import { AuthenticatedRequest } from '../middleware/auth';
import { Op } from 'sequelize';

// 获取所有动作列表
export const getActions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const actions = await Action.findAll();
    res.success({ actions });
  } catch (error) {
    res.error(500, '服务器错误');
  }
};

// 创建新动作
export const createAction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, type, duration, steps } = req.body;
    
    // 检查动作是否已存在
    const actionExists = await Action.findOne({ where: { name } });
    if (actionExists) {
      return res.error(400, '动作已存在');
    }
    
    // 验证动作组合的步骤
    if (type === 'combination') {
      await validateCombinationSteps(steps);
    }
    
    // 创建新动作
    const action = await Action.create({
      name,
      description,
      type,
      duration,
      steps
    });
    
    res.created({ action }, '动作创建成功');
  } catch (error) {
    res.error(500, error instanceof Error ? error.message : '服务器错误');
  }
};

// 更新动作信息
export const updateAction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, type, duration, steps } = req.body;
    
    // 检查动作是否存在
    const action = await Action.findByPk(id);
    if (!action) {
      return res.error(404, '动作不存在');
    }
    
    // 验证动作组合的步骤
    if (type === 'combination') {
      await validateCombinationSteps(steps);
    }
    
    // 更新动作信息
    await Action.update(
      { name, description, type, duration, steps },
      { where: { id } }
    );
    
    // 获取更新后的动作信息
    const updatedAction = await Action.findByPk(id);
    
    res.success({ action: updatedAction }, '动作信息更新成功');
  } catch (error) {
    res.error(500, error instanceof Error ? error.message : '服务器错误');
  }
};

// 删除动作
export const deleteAction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // 检查动作是否存在
    const action = await Action.findByPk(id);
    if (!action) {
      return res.error(404, '动作不存在');
    }
    
    // 检查动作是否被其他动作组合使用
    const isUsedInCombination = await Action.count({
      where: {
        type: 'combination',
        steps: {
          [Op.like]: `%${id}%`
        }
      }
    });
    
    if (isUsedInCombination > 0) {
      return res.error(400, '该动作被用于动作组合中，请先从组合中移除');
    }
    
    // 删除动作
    await Action.destroy({
      where: { id }
    });
    
    res.success(null, '动作删除成功');
  } catch (error) {
    res.error(500, '服务器错误');
  }
};

// 获取单个动作信息
export const getAction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // 检查动作是否存在
    const action = await Action.findByPk(id);
    if (!action) {
      return res.error(404, '动作不存在');
    }
    
    // 如果是动作组合，获取组合中包含的具体动作信息
    let combinationDetails = null;
    if (action.type === 'combination') {
      const stepIds = Array.isArray(action.steps) ? action.steps : JSON.parse(action.steps as string);
      const actions = await Action.findAll({
        where: {
          id: stepIds
        }
      });
      combinationDetails = actions;
    }
    
    res.success({ action, combinationDetails });
  } catch (error) {
    res.error(500, '服务器错误');
  }
};

// 验证动作组合的步骤
const validateCombinationSteps = async (steps: number[]) => {
  if (!Array.isArray(steps)) {
    throw new Error('Steps must be an array');
  }
  
  if (steps.length === 0) {
    throw new Error('Steps cannot be empty');
  }
  
  // 检查步骤中的动作是否存在
  const actionIds = steps;
  const existingActions = await Action.findAll({
    where: {
      id: actionIds
    }
  });
  
  if (existingActions.length !== actionIds.length) {
    throw new Error('Some actions in steps do not exist');
  }
  
  // 检查动作组合的总时长是否符合要求（<3s）
  const totalDuration = existingActions.reduce((sum, action) => sum + action.duration, 0);
  if (totalDuration > 3) {
    throw new Error('Total duration of action combination must be less than 3 seconds');
  }
};

// 执行动作或动作组合
export const executeAction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { actionId } = req.body;
    
    // 检查动作是否存在
    const action = await Action.findByPk(actionId);
    if (!action) {
      return res.error(404, '动作不存在');
    }
    
    // 根据动作类型执行不同的逻辑
    let executionResult;
    if (action.type === 'combination') {
      // 执行动作组合
      executionResult = await executeActionCombination(action);
    } else {
      // 执行单个动作
      executionResult = await executeSingleAction(action);
    }
    
    res.success({ result: executionResult }, '动作执行成功');
  } catch (error) {
    res.error(500, error instanceof Error ? error.message : '服务器错误');
  }
};

// 执行单个动作
const executeSingleAction = async (action: Action) => {
  // 这里可以添加实际的动作执行逻辑
  // 例如，发送命令到机器人设备
  return {
    actionId: action.id,
    actionName: action.name,
    type: action.type,
    steps: action.steps,
    duration: action.duration,
    executedAt: new Date()
  };
};

// 执行动作组合
const executeActionCombination = async (combination: Action) => {
  const stepIds = Array.isArray(combination.steps) ? combination.steps : JSON.parse(combination.steps as string);
  const actions = await Action.findAll({
    where: {
      id: stepIds
    }
  });
  
  // 按步骤顺序执行动作
  const executionResults = [];
  for (const action of actions) {
    const result = await executeSingleAction(action);
    executionResults.push(result);
    // 可以在这里添加动作之间的延迟
    // await new Promise(resolve => setTimeout(resolve, action.duration * 1000));
  }
  
  return {
    combinationId: combination.id,
    combinationName: combination.name,
    steps: executionResults,
    totalDuration: combination.duration,
    executedAt: new Date()
  };
};

// 初始化基本动作
export const initBasicActions = async () => {
  try {
    // 检查是否已存在基本动作
    const basicActionsCount = await Action.count({
      where: { type: 'basic' }
    });
    if (basicActionsCount > 0) {
      return;
    }
    
    // 定义基本动作
    const basicActions = [
      {
        name: '前进',
        description: '机器人向前移动',
        type: 'basic',
        duration: 1,
        steps: ['前进']
      },
      {
        name: '后退',
        description: '机器人向后移动',
        type: 'basic',
        duration: 1,
        steps: ['后退']
      },
      {
        name: '左转',
        description: '机器人向左转',
        type: 'basic',
        duration: 0.5,
        steps: ['左转']
      },
      {
        name: '右转',
        description: '机器人向右转',
        type: 'basic',
        duration: 0.5,
        steps: ['右转']
      },
      {
        name: '趴下',
        description: '机器人趴下',
        type: 'basic',
        duration: 1,
        steps: ['趴下']
      },
      {
        name: '起来',
        description: '机器人站起来',
        type: 'basic',
        duration: 1,
        steps: ['起来']
      }
    ];
    
    // 创建基本动作
    await Action.bulkCreate(basicActions as any);
    console.log('Basic actions initialized successfully');
  } catch (error) {
    console.error('Error initializing basic actions:', error);
  }
};
