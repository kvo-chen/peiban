import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { deviceApi, actionApi, deviceActionApi, chatApi } from '../services/api';
import { Device, Action, DeviceAction, ChatRequest, Conversation } from '../types';

const DeviceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [device, setDevice] = useState<Device | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [deviceActions, setDeviceActions] = useState<DeviceAction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newDeviceAction, setNewDeviceAction] = useState({ actionId: '', prompt: '' });
  const [chatMessage, setChatMessage] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // 获取设备详情
  const fetchDeviceDetail = async () => {
    if (!id) return;
    
    try {
      const response = await deviceApi.getDevice(id);
      setDevice(response.device);
    } catch (err: any) {
      setError('获取设备详情失败，请稍后重试');
    }
  };

  // 获取所有动作
  const fetchActions = async () => {
    try {
      const response = await actionApi.getActions();
      setActions(response.actions);
    } catch (err: any) {
      setError('获取动作列表失败，请稍后重试');
    }
  };

  // 获取设备的动作映射
  const fetchDeviceActions = async () => {
    if (!id) return;
    
    try {
      const response = await deviceActionApi.getDeviceActions(id);
      setDeviceActions(response.deviceActions);
    } catch (err: any) {
      setError('获取设备动作映射失败，请稍后重试');
    }
  };

  // 获取对话历史
  const fetchChatHistory = async () => {
    if (!id) return;
    
    try {
      const response = await chatApi.getChatHistory(id);
      setConversations(response.conversations.reverse());
    } catch (err: any) {
      setError('获取对话历史失败，请稍后重试');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      await Promise.all([
        fetchDeviceDetail(),
        fetchActions(),
        fetchDeviceActions(),
        fetchChatHistory()
      ]);
      
      setLoading(false);
    };
    
    fetchData();
  }, [id]);

  // 添加设备动作映射
  const handleAddDeviceAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      await deviceActionApi.addDeviceAction({
        deviceId: id,
        actionId: newDeviceAction.actionId,
        prompt: newDeviceAction.prompt
      });
      
      setIsAddModalOpen(false);
      setNewDeviceAction({ actionId: '', prompt: '' });
      fetchDeviceActions();
    } catch (err: any) {
      setError('添加设备动作映射失败，请稍后重试');
    }
  };

  // 删除设备动作映射
  const handleDeleteDeviceAction = async (deviceActionId: string) => {
    if (window.confirm('确定要删除该动作映射吗？')) {
      try {
        await deviceActionApi.deleteDeviceAction(deviceActionId);
        fetchDeviceActions();
      } catch (err: any) {
        setError('删除设备动作映射失败，请稍后重试');
      }
    }
  };

  // 发送AI对话消息
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !chatMessage.trim()) return;
    
    try {
      const chatRequest: ChatRequest = {
        deviceId: id,
        message: chatMessage.trim()
      };
      
      const response = await chatApi.sendMessage(chatRequest);
      
      // 更新对话历史
      setConversations(prev => [...prev, response.conversation]);
      setChatMessage('');
    } catch (err: any) {
      setError('发送消息失败，请稍后重试');
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!device) {
    return <div className="error-message">设备不存在</div>;
  }

  return (
    <div className="device-detail">
      <div className="device-detail-header">
        <div>
          <h2>{device.deviceName}</h2>
          <p className="device-type">类型：{device.deviceType}</p>
          <p className="device-status">
            状态：<span className={`status-badge ${device.status}`}>
              {device.status === 'online' ? '在线' : '离线'}
            </span>
          </p>
        </div>
        <Link to="/" className="back-button">
          返回设备列表
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="device-detail-content">
        {/* 设备动作配置 */}
        <div className="device-actions-section">
          <div className="section-header">
            <h3>设备动作配置</h3>
            <button 
              className="add-device-action-button"
              onClick={() => setIsAddModalOpen(true)}
            >
              添加动作映射
            </button>
          </div>

          <div className="device-action-list">
            {deviceActions.length === 0 ? (
              <div className="no-device-actions">
                <p>还没有添加动作映射</p>
                <button 
                  className="add-device-action-button"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  添加第一个动作映射
                </button>
              </div>
            ) : (
              <table className="device-action-table">
                <thead>
                  <tr>
                    <th>动作名称</th>
                    <th>触发提示词</th>
                    <th>动作时长</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {deviceActions.map(da => (
                    <tr key={da._id}>
                      <td>{da.actionId.name}</td>
                      <td>{da.prompt}</td>
                      <td>{da.actionId.duration}秒</td>
                      <td>
                        <button 
                          className="action-button delete"
                          onClick={() => handleDeleteDeviceAction(da._id)}
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* AI对话 */}
        <div className="chat-section">
          <h3>AI对话</h3>
          <div className="chat-container">
            <div className="chat-history">
              {conversations.length === 0 ? (
                <div className="no-chat-history">
                  <p>还没有对话记录</p>
                  <p>开始和你的机器人聊天吧！</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <div key={conv._id} className="chat-message">
                    <div className="user-message">
                      <strong>你：</strong>{conv.message}
                    </div>
                    <div className="ai-response">
                      <strong>AI：</strong>{conv.response}
                      {conv.actionTriggered && (
                        <div className="action-triggered">
                          <span className="action-icon">🤖</span>
                          <span>触发动作</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="chat-input-form">
              <input
                type="text"
                placeholder="输入消息..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                required
                className="chat-input"
              />
              <button type="submit" className="send-button">发送</button>
            </form>
          </div>
        </div>
      </div>

      {/* 添加设备动作映射模态框 */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>添加动作映射</h3>
              <button 
                className="close-button"
                onClick={() => setIsAddModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddDeviceAction}>
              <div className="form-group">
                <label htmlFor="actionId">选择动作</label>
                <select
                  id="actionId"
                  value={newDeviceAction.actionId}
                  onChange={(e) => setNewDeviceAction({ ...newDeviceAction, actionId: e.target.value })}
                  required
                >
                  <option value="">请选择动作</option>
                  {actions.map(action => (
                    <option key={action._id} value={action._id}>
                      {action.name} - {action.description}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="prompt">触发提示词</label>
                <input
                  type="text"
                  id="prompt"
                  value={newDeviceAction.prompt}
                  onChange={(e) => setNewDeviceAction({ ...newDeviceAction, prompt: e.target.value })}
                  required
                  placeholder="例如：前进、左转、趴下等"
                />
              </div>
              <div className="modal-footer">
                <button 
                  type="button"
                  className="cancel-button"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  取消
                </button>
                <button type="submit" className="submit-button">
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceDetail;
