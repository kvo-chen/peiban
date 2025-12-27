"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleActionMatch = exports.getChatHistory = exports.chatWithAI = void 0;
const Conversation_1 = __importDefault(require("../models/Conversation"));
const DeviceAction_1 = __importDefault(require("../models/DeviceAction"));
const Action_1 = __importDefault(require("../models/Action"));
const openai_1 = require("openai");
// 初始化OpenAI客户端
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
// AI对话处理（集成OpenAI API）
const chatWithAI = async (req, res) => {
    try {
        const { deviceId, message } = req.body;
        // 检查是否提供了设备ID
        if (!deviceId) {
            return res.error(400, '设备ID不能为空');
        }
        // 获取设备的动作映射列表，包含关联的Action信息
        const deviceActions = await DeviceAction_1.default.findAll({
            where: { device_id: deviceId },
            include: [{ model: Action_1.default }]
        });
        // 提取设备可用的动作列表，用于OpenAI提示词
        const availableActions = deviceActions.map(da => {
            if (da.action) {
                return {
                    id: da.action.id,
                    name: da.action.name,
                    description: da.action.description,
                    prompt: da.prompt
                };
            }
            else {
                return {
                    id: da.id,
                    name: '未知动作',
                    description: '',
                    prompt: da.prompt
                };
            }
        });
        // 查找匹配的动作
        let actionTriggered = null;
        let response = '';
        // 使用OpenAI API进行动作匹配
        const matchedAction = await openAIActionMatch(message, availableActions);
        if (matchedAction) {
            actionTriggered = matchedAction;
            // 获取匹配的动作名称
            const action = await Action_1.default.findByPk(matchedAction);
            if (action) {
                response = `已触发动作：${action.name}`;
            }
            else {
                response = '已触发动作';
            }
        }
        else {
            // 如果没有匹配的动作，使用OpenAI生成友好回复
            response = await generateAIResponse(message);
        }
        // 保存对话记录
        const conversation = await Conversation_1.default.create({
            user_id: req.user.id,
            device_id: deviceId,
            message,
            response,
            action_triggered: actionTriggered
        });
        // 返回响应
        res.success({
            conversation: {
                id: conversation.id,
                message: conversation.message,
                response: conversation.response,
                actionTriggered,
                createdAt: conversation.created_at
            }
        }, '对话响应生成成功');
    }
    catch (error) {
        console.error('Error in chatWithAI:', error);
        res.error(500, '服务器错误');
    }
};
exports.chatWithAI = chatWithAI;
// 获取对话历史
const getChatHistory = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { limit = 50 } = req.query;
        // 检查是否提供了设备ID
        if (!deviceId) {
            return res.error(400, '设备ID不能为空');
        }
        // 获取对话历史
        const conversations = await Conversation_1.default.findAll({
            where: {
                user_id: req.user.id,
                device_id: deviceId
            },
            order: [['created_at', 'DESC']],
            limit: Number(limit)
        });
        res.success({ conversations });
    }
    catch (error) {
        res.error(500, '服务器错误');
    }
};
exports.getChatHistory = getChatHistory;
// 使用OpenAI API进行动作匹配
const openAIActionMatch = async (message, availableActions) => {
    try {
        // 构建系统提示词
        const systemPrompt = `你是一个机器人动作控制器，根据用户的自然语言指令匹配最适合的动作。
    可用的动作列表：
    ${availableActions.map(action => `动作ID: ${action.id}, 动作名称: ${action.name}, 动作描述: ${action.description}, 触发提示词: ${action.prompt}`).join('\n    ')}
    
    请分析用户的指令，从可用动作列表中选择最匹配的动作ID。如果没有匹配的动作，请返回null。
    只返回动作ID或null，不要添加任何其他解释。`;
        // 调用OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: 0.3,
            max_tokens: 50
        });
        const result = completion.choices[0].message.content?.trim();
        // 如果返回的是数字ID，转换为数字类型
        if (result && !isNaN(Number(result)) && result !== 'null') {
            return Number(result);
        }
        return null;
    }
    catch (error) {
        console.error('Error in openAIActionMatch:', error);
        // 如果OpenAI API调用失败，回退到简单动作匹配
        return (0, exports.simpleActionMatch)(message, availableActions);
    }
};
// 使用OpenAI API生成友好回复
const generateAIResponse = async (message) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "你是一个友好的AI机器人助手，会用简洁明了的方式回应用户的问题。" },
                { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 100
        });
        return completion.choices[0].message.content?.trim() || '我收到了你的消息';
    }
    catch (error) {
        console.error('Error in generateAIResponse:', error);
        return `我收到了你的消息：${message}`;
    }
};
// 简单的动作匹配（作为OpenAI API调用失败的回退方案）
const simpleActionMatch = async (message, deviceActions) => {
    // 将用户消息转换为小写，方便匹配
    const lowerMessage = message.toLowerCase();
    // 遍历设备动作映射，查找匹配的提示词
    for (const deviceAction of deviceActions) {
        const prompt = deviceAction.prompt?.toLowerCase() || deviceAction.name?.toLowerCase();
        if (prompt && lowerMessage.includes(prompt)) {
            return deviceAction.id;
        }
    }
    return null;
};
exports.simpleActionMatch = simpleActionMatch;
//# sourceMappingURL=chat.js.map