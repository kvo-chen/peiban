import express from 'express';
import {
  getDeviceUsageStats,
  getActionUsageStats,
  getConversationTrend,
  getDeviceActivationRate,
  getAIResponseStats,
  getComprehensiveAnalysis
} from '../controllers/dataAnalysis';
import auth from '../middleware/auth';

const router = express.Router();

// 获取设备使用统计
router.get('/device-usage', auth, getDeviceUsageStats);

// 获取动作使用统计
router.get('/action-usage', auth, getActionUsageStats);

// 获取对话趋势
router.get('/conversation-trend', auth, getConversationTrend);

// 获取设备激活率
router.get('/device-activation-rate', auth, getDeviceActivationRate);

// 获取AI响应效率统计
router.get('/ai-response-stats', auth, getAIResponseStats);

// 获取综合数据分析
router.get('/comprehensive', auth, getComprehensiveAnalysis);

export default router;
