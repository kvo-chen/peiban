import { Op } from 'sequelize';
import OperationLog from '../models/OperationLog';
import AnomalyLog from '../models/AnomalyLog';

// 异常行为监控服务
class AnomalyMonitoringService {
  // 记录登录失败
  static async recordFailedLogin(user_id: number, username: string, ip: string, user_agent: string) {
    // 记录操作日志
    await OperationLog.create({
      user_id,
      username,
      operation: 'login',
      module: 'auth',
      ip,
      user_agent,
      status: 'failed',
      details: '登录失败'
    });
    
    // 检测是否为多次登录失败
    const failedLoginCount = await OperationLog.count({
      where: {
        user_id,
        operation: 'login',
        status: 'failed',
        module: 'auth',
        created_at: {
          [Op.gt]: new Date(Date.now() - 3600000) // 过去1小时内
        }
      }
    });
    
    // 如果过去1小时内登录失败次数超过5次，记录异常
    if (failedLoginCount >= 5) {
      await AnomalyLog.create({
        user_id,
        username,
        event_type: 'multiple_login_attempts',
        ip,
        location: '',
        user_agent,
        details: `1小时内登录失败${failedLoginCount}次`,
        severity: 'high',
        status: 'unresolved'
      });
    } else {
      // 记录单次登录失败异常
      await AnomalyLog.create({
        user_id,
        username,
        event_type: 'failed_login',
        ip,
        location: '',
        user_agent,
        details: '登录失败',
        severity: 'low',
        status: 'unresolved'
      });
    }
  }
  
  // 记录可疑操作
  static async recordSuspiciousOperation(user_id: number, username: string, operation: string, module: string, ip: string, user_agent: string, details: string) {
    await AnomalyLog.create({
      user_id,
      username,
      event_type: 'suspicious_operation',
      ip,
      location: '',
      user_agent,
      details,
      severity: 'medium',
      status: 'unresolved'
    });
  }
  
  // 记录MFA验证失败
  static async recordMfaFailure(user_id: number, username: string, ip: string, user_agent: string) {
    await AnomalyLog.create({
      user_id,
      username,
      event_type: 'mfa_failure',
      ip,
      location: '',
      user_agent,
      details: 'MFA验证失败',
      severity: 'medium',
      status: 'unresolved'
    });
  }
  
  // 获取最近的异常记录
  static async getRecentAnomalies(limit: number = 50) {
    return AnomalyLog.findAll({
      order: [['created_at', 'DESC']],
      limit
    });
  }
  
  // 解决异常
  static async resolveAnomaly(id: number, resolved_by: number) {
    return AnomalyLog.update(
      {
        status: 'resolved',
        resolved_at: new Date(),
        resolved_by
      },
      { where: { id } }
    );
  }
  
  // 忽略异常
  static async ignoreAnomaly(id: number) {
    return AnomalyLog.update(
      {
        status: 'ignored'
      },
      { where: { id } }
    );
  }
}

export default AnomalyMonitoringService;