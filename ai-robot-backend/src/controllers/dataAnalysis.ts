import { AuthenticatedRequest } from '../middleware/auth';
import { CustomResponse } from '../types/CustomResponse';
import DataAnalysisService from '../services/dataAnalysisService';

// 获取设备使用统计
export const getDeviceUsageStats = async (req: AuthenticatedRequest, res: CustomResponse) => {
  try {
    const { days = 30 } = req.query;
    const stats = await DataAnalysisService.getDeviceUsageStats(req.user.id, parseInt(days as string));
    res.success({ stats });
  } catch (error) {
    res.error(500, error instanceof Error ? error.message : '服务器错误');
  }
};

// 获取动作使用统计
export const getActionUsageStats = async (req: AuthenticatedRequest, res: CustomResponse) => {
  try {
    const { days = 30 } = req.query;
    const stats = await DataAnalysisService.getActionUsageStats(req.user.id, parseInt(days as string));
    res.success({ stats });
  } catch (error) {
    res.error(500, error instanceof Error ? error.message : '服务器错误');
  }
};

// 获取对话趋势
export const getConversationTrend = async (req: AuthenticatedRequest, res: CustomResponse) => {
  try {
    const { days = 30 } = req.query;
    const trend = await DataAnalysisService.getConversationTrend(req.user.id, parseInt(days as string));
    res.success({ trend });
  } catch (error) {
    res.error(500, error instanceof Error ? error.message : '服务器错误');
  }
};

// 获取设备激活率
export const getDeviceActivationRate = async (req: AuthenticatedRequest, res: CustomResponse) => {
  try {
    const { days = 30 } = req.query;
    const rate = await DataAnalysisService.getDeviceActivationRate(req.user.id, parseInt(days as string));
    res.success(rate);
  } catch (error) {
    res.error(500, error instanceof Error ? error.message : '服务器错误');
  }
};

// 获取AI响应效率统计
export const getAIResponseStats = async (req: AuthenticatedRequest, res: CustomResponse) => {
  try {
    const { days = 30 } = req.query;
    const stats = await DataAnalysisService.getAIResponseStats(req.user.id, parseInt(days as string));
    res.success(stats);
  } catch (error) {
    res.error(500, error instanceof Error ? error.message : '服务器错误');
  }
};

// 获取综合数据分析
export const getComprehensiveAnalysis = async (req: AuthenticatedRequest, res: CustomResponse) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days as string);
    
    // 并行获取所有统计数据
    const [
      deviceUsageStats,
      actionUsageStats,
      conversationTrend,
      deviceActivationRate,
      aiResponseStats
    ] = await Promise.all([
      DataAnalysisService.getDeviceUsageStats(req.user.id, daysNum),
      DataAnalysisService.getActionUsageStats(req.user.id, daysNum),
      DataAnalysisService.getConversationTrend(req.user.id, daysNum),
      DataAnalysisService.getDeviceActivationRate(req.user.id, daysNum),
      DataAnalysisService.getAIResponseStats(req.user.id, daysNum)
    ]);
    
    res.success({
      deviceUsageStats,
      actionUsageStats,
      conversationTrend,
      deviceActivationRate,
      aiResponseStats
    });
  } catch (error) {
    res.error(500, error instanceof Error ? error.message : '服务器错误');
  }
};
