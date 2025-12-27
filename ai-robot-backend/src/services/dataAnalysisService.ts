import { Op, literal } from 'sequelize';
import Conversation from '../models/Conversation';
import Device from '../models/Device';
import Action from '../models/Action';
import DeviceAction from '../models/DeviceAction';

// 数据分析服务
class DataAnalysisService {
  // 获取设备使用统计
  static async getDeviceUsageStats(user_id: number, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // 使用一次查询获取所有设备及其统计数据，避免循环查询
    const devices = await Device.findAll({
      where: { user_id },
      attributes: [
        'id',
        'device_name',
        'device_type',
        'status',
        // 使用子查询获取对话次数
        [literal(`(
          SELECT COUNT(*) 
          FROM conversations 
          WHERE conversations.device_id = Device.id 
          AND conversations.user_id = ${user_id} 
          AND conversations.created_at > '${startDate.toISOString()}'
        )`), 'conversationCount'],
        // 使用子查询获取触发动作次数
        [literal(`(
          SELECT COUNT(*) 
          FROM conversations 
          WHERE conversations.device_id = Device.id 
          AND conversations.user_id = ${user_id} 
          AND conversations.action_triggered IS NOT NULL 
          AND conversations.created_at > '${startDate.toISOString()}'
        )`), 'actionTriggeredCount'],
        // 使用子查询获取绑定的动作数量
        [literal(`(
          SELECT COUNT(*) 
          FROM device_actions 
          WHERE device_actions.device_id = Device.id
        )`), 'boundActionsCount']
      ]
    });
    
    // 格式化结果
    const deviceStats = devices.map(device => {
      // 将device转换为普通对象，以便访问自定义属性
      const deviceObj = device.toJSON() as any;
      return {
        deviceId: device.id,
        deviceName: device.device_name,
        deviceType: device.device_type,
        status: device.status,
        conversationCount: parseInt(deviceObj.conversationCount as string),
        actionTriggeredCount: parseInt(deviceObj.actionTriggeredCount as string),
        boundActionsCount: parseInt(deviceObj.boundActionsCount as string)
      };
    });
    
    return deviceStats;
  }
  
  // 获取动作使用统计
  static async getActionUsageStats(user_id: number, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // 使用单个查询获取动作使用统计，避免循环查询
    const actions = await Action.findAll({
      attributes: [
        'id',
        'name',
        'type',
        'duration',
        // 使用子查询获取动作使用次数
        [literal(`(
          SELECT COUNT(*) 
          FROM conversations 
          WHERE conversations.action_triggered = Action.id 
          AND conversations.user_id = ${user_id} 
          AND conversations.created_at > '${startDate.toISOString()}'
        )`), 'usageCount']
      ],
      where: {
        // 只获取用户设备绑定的动作
        id: {
          [Op.in]: literal(`(
            SELECT DISTINCT action_id 
            FROM device_actions 
            WHERE device_id IN (
              SELECT id FROM devices WHERE user_id = ${user_id}
            )
          )`)
        }
      }
    });
    
    // 格式化结果并排序
    const actionStats = actions.map(action => {
      // 将action转换为普通对象，以便访问自定义属性
      const actionObj = action.toJSON() as any;
      return {
        actionId: action.id,
        actionName: action.name,
        actionType: action.type,
        usageCount: parseInt(actionObj.usageCount as string),
        duration: action.duration
      };
    });
    
    // 按使用次数排序
    actionStats.sort((a, b) => b.usageCount - a.usageCount);
    
    return actionStats;
  }
  
  // 获取对话趋势
  static async getConversationTrend(user_id: number, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // 生成日期范围
    const dateRange = [];
    const dateMap = new Map();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dateRange.push(dateStr);
      dateMap.set(dateStr, 0); // 初始化计数为0
    }
    
    // 使用单个分组查询获取所有日期的对话次数
    const results = await Conversation.findAll({
      attributes: [
        [literal(`DATE(created_at)`), 'date'],
        [literal(`COUNT(*)`), 'count']
      ],
      where: {
        user_id,
        created_at: {
          [Op.gte]: startDate
        }
      },
      group: ['date']
    });
    
    // 将查询结果映射到日期范围内
    results.forEach(result => {
      // 将result转换为普通对象，以便访问自定义属性
      const resultObj = result.toJSON() as any;
      const date = resultObj.date as string;
      const count = parseInt(resultObj.count as string);
      if (dateMap.has(date)) {
        dateMap.set(date, count);
      }
    });
    
    // 生成最终的对话趋势数据
    const conversationTrend = dateRange.map(date => ({
      date,
      count: dateMap.get(date)
    }));
    
    return conversationTrend;
  }
  
  // 获取设备激活率
  static async getDeviceActivationRate(user_id: number, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // 获取用户的所有设备
    const totalDevices = await Device.count({
      where: { user_id }
    });
    
    // 获取在指定时间范围内有对话记录的设备数量
    const activeDevices = await Device.count({
      where: {
        user_id,
        id: {
          [Op.in]: literal(`(SELECT DISTINCT device_id FROM conversations WHERE user_id = ${user_id} AND created_at > '${startDate.toISOString()}')`)
        }
      }
    });
    
    // 计算激活率
    const activationRate = totalDevices > 0 ? (activeDevices / totalDevices) * 100 : 0;
    
    return {
      totalDevices,
      activeDevices,
      activationRate: parseFloat(activationRate.toFixed(2))
    };
  }
  
  // 获取AI响应效率统计
  static async getAIResponseStats(user_id: number, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // 获取指定时间范围内的所有对话
    const conversations = await Conversation.findAll({
      where: {
        user_id,
        created_at: {
          [Op.gt]: startDate
        }
      }
    });
    
    // 计算触发动作的比例
    const totalConversations = conversations.length;
    const actionTriggeredConversations = conversations.filter(c => c.action_triggered !== null).length;
    const actionTriggerRate = totalConversations > 0 ? (actionTriggeredConversations / totalConversations) * 100 : 0;
    
    return {
      totalConversations,
      actionTriggeredConversations,
      actionTriggerRate: parseFloat(actionTriggerRate.toFixed(2))
    };
  }
}

export default DataAnalysisService;
