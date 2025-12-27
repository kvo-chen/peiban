"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBasicActions = exports.executeAction = exports.getAction = exports.deleteAction = exports.updateAction = exports.createAction = exports.getActions = void 0;
const Action_1 = __importDefault(require("../models/Action"));
const sequelize_1 = require("sequelize");
// 获取所有动作列表
const getActions = async (req, res) => {
    try {
        const actions = await Action_1.default.findAll();
        res.success({ actions });
    }
    catch (error) {
        res.error(500, '服务器错误');
    }
};
exports.getActions = getActions;
// 创建新动作
const createAction = async (req, res) => {
    try {
        const { name, description, type, duration, steps } = req.body;
        // 检查动作是否已存在
        const actionExists = await Action_1.default.findOne({ where: { name } });
        if (actionExists) {
            return res.error(400, '动作已存在');
        }
        // 验证动作组合的步骤
        if (type === 'combination') {
            await validateCombinationSteps(steps);
        }
        // 创建新动作
        const action = await Action_1.default.create({
            name,
            description,
            type,
            duration,
            steps
        });
        res.created({ action }, '动作创建成功');
    }
    catch (error) {
        res.error(500, error instanceof Error ? error.message : '服务器错误');
    }
};
exports.createAction = createAction;
// 更新动作信息
const updateAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, type, duration, steps } = req.body;
        // 检查动作是否存在
        const action = await Action_1.default.findByPk(id);
        if (!action) {
            return res.error(404, '动作不存在');
        }
        // 验证动作组合的步骤
        if (type === 'combination') {
            await validateCombinationSteps(steps);
        }
        // 更新动作信息
        await Action_1.default.update({ name, description, type, duration, steps }, { where: { id } });
        // 获取更新后的动作信息
        const updatedAction = await Action_1.default.findByPk(id);
        res.success({ action: updatedAction }, '动作信息更新成功');
    }
    catch (error) {
        res.error(500, error instanceof Error ? error.message : '服务器错误');
    }
};
exports.updateAction = updateAction;
// 删除动作
const deleteAction = async (req, res) => {
    try {
        const { id } = req.params;
        // 检查动作是否存在
        const action = await Action_1.default.findByPk(id);
        if (!action) {
            return res.error(404, '动作不存在');
        }
        // 检查动作是否被其他动作组合使用
        const isUsedInCombination = await Action_1.default.count({
            where: {
                type: 'combination',
                steps: {
                    [sequelize_1.Op.like]: `%${id}%`
                }
            }
        });
        if (isUsedInCombination > 0) {
            return res.error(400, '该动作被用于动作组合中，请先从组合中移除');
        }
        // 删除动作
        await Action_1.default.destroy({
            where: { id }
        });
        res.success(null, '动作删除成功');
    }
    catch (error) {
        res.error(500, '服务器错误');
    }
};
exports.deleteAction = deleteAction;
// 获取单个动作信息
const getAction = async (req, res) => {
    try {
        const { id } = req.params;
        // 检查动作是否存在
        const action = await Action_1.default.findByPk(id);
        if (!action) {
            return res.error(404, '动作不存在');
        }
        // 如果是动作组合，获取组合中包含的具体动作信息
        let combinationDetails = null;
        if (action.type === 'combination') {
            const stepIds = Array.isArray(action.steps) ? action.steps : JSON.parse(action.steps);
            const actions = await Action_1.default.findAll({
                where: {
                    id: stepIds
                }
            });
            combinationDetails = actions;
        }
        res.success({ action, combinationDetails });
    }
    catch (error) {
        res.error(500, '服务器错误');
    }
};
exports.getAction = getAction;
// 验证动作组合的步骤
const validateCombinationSteps = async (steps) => {
    if (!Array.isArray(steps)) {
        throw new Error('Steps must be an array');
    }
    if (steps.length === 0) {
        throw new Error('Steps cannot be empty');
    }
    // 检查步骤中的动作是否存在
    const actionIds = steps;
    const existingActions = await Action_1.default.findAll({
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
const executeAction = async (req, res) => {
    try {
        const { actionId } = req.body;
        // 检查动作是否存在
        const action = await Action_1.default.findByPk(actionId);
        if (!action) {
            return res.error(404, '动作不存在');
        }
        // 根据动作类型执行不同的逻辑
        let executionResult;
        if (action.type === 'combination') {
            // 执行动作组合
            executionResult = await executeActionCombination(action);
        }
        else {
            // 执行单个动作
            executionResult = await executeSingleAction(action);
        }
        res.success({ result: executionResult }, '动作执行成功');
    }
    catch (error) {
        res.error(500, error instanceof Error ? error.message : '服务器错误');
    }
};
exports.executeAction = executeAction;
// 执行单个动作
const executeSingleAction = async (action) => {
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
const executeActionCombination = async (combination) => {
    const stepIds = Array.isArray(combination.steps) ? combination.steps : JSON.parse(combination.steps);
    const actions = await Action_1.default.findAll({
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
const initBasicActions = async () => {
    try {
        // 检查是否已存在基本动作
        const basicActionsCount = await Action_1.default.count({
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
        await Action_1.default.bulkCreate(basicActions);
        console.log('Basic actions initialized successfully');
    }
    catch (error) {
        console.error('Error initializing basic actions:', error);
    }
};
exports.initBasicActions = initBasicActions;
//# sourceMappingURL=action.js.map