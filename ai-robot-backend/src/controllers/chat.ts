import { AuthenticatedRequest } from '../middleware/auth';
import { Response } from 'express';
import Conversation from '../models/Conversation';
import DeviceAction from '../models/DeviceAction';
import Action from '../models/Action';
import { OpenAI } from 'openai';
import websocketService from '../services/websocketService';

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI对话处理（集成OpenAI API）
export const createChat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deviceId, message } = req.body;
    
    // 检查是否提供了设备ID
    if (!deviceId) {
      return (res as any).error(400, '设备ID不能为空');
    }
    
    // 获取设备的动作映射列表，包含关联的Action信息
    const deviceActions = await DeviceAction.findAll({
      where: { device_id: deviceId },
      include: [{ model: Action }]
    });
    
    // 提取设备可用的动作列表，用于OpenAI提示词
    const availableActions = deviceActions.map(da => {
      // 使用类型断言来访问关联的Action信息
      const deviceActionWithAction = da as any;
      if (deviceActionWithAction.action) {
        return {
          id: deviceActionWithAction.action.id,
          name: deviceActionWithAction.action.name,
          description: deviceActionWithAction.action.description,
          prompt: deviceActionWithAction.prompt
        };
      } else {
        return {
          id: deviceActionWithAction.id,
          name: '未知动作',
          description: '',
          prompt: deviceActionWithAction.prompt
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
      const action = await Action.findByPk(matchedAction);
      if (action) {
        response = `已触发动作：${action.name}`;
      } else {
        response = '已触发动作';
      }
    } else {
      // 如果没有匹配的动作，使用OpenAI生成友好回复
      response = await generateAIResponse(message);
    }
    
    // 保存对话记录
    const conversation = await Conversation.create({
      user_id: req.user.id,
      device_id: deviceId,
      message,
      response,
      action_triggered: actionTriggered
    });
    
    const conversationData = {
      id: conversation.id,
      message: conversation.message,
      response: conversation.response,
      actionTriggered,
      createdAt: conversation.created_at,
      deviceId: deviceId
    };
    
    // 通过WebSocket推送消息给用户的所有在线设备
    websocketService.sendChatMessage(req.user.id, conversationData);
    
    // 返回响应
    (res as any).success({
      conversation: conversationData
    }, '对话响应生成成功');
  } catch (error) {
    console.error('Error in chatWithAI:', error);
    (res as any).error(500, '服务器错误');
  }
};

// 获取对话历史
export const getChatHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { limit = 50 } = req.query;
    
    // 检查是否提供了设备ID
    if (!deviceId) {
      return (res as any).error(400, '设备ID不能为空');
    }
    
    // 获取对话历史
    const conversations = await Conversation.findAll({
      where: { 
        user_id: req.user.id, 
        device_id: deviceId 
      },
      order: [['created_at', 'DESC']],
      limit: Number(limit)
    });
    
    // 转换为普通对象，避免序列化问题
    const conversationsJSON = conversations.map(conv => conv.toJSON());
    (res as any).success({ conversations: conversationsJSON });
  } catch (error) {
    (res as any).error(500, '服务器错误');
  }
};

// 使用OpenAI API进行动作匹配
const openAIActionMatch = async (message: string, availableActions: any[]) => {
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
  } catch (error) {
    console.error('Error in openAIActionMatch:', error);
    // 如果OpenAI API调用失败，回退到简单动作匹配
    return simpleActionMatch(message, availableActions);
  }
};

// 使用OpenAI API生成友好回复
const generateAIResponse = async (message: string) => {
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
  } catch (error) {
    console.error('Error in generateAIResponse:', error);
    return `我收到了你的消息：${message}`;
  }
};

// 简单的动作匹配（作为OpenAI API调用失败的回退方案）
export const simpleActionMatch = async (message: string, deviceActions: any[]) => {
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
