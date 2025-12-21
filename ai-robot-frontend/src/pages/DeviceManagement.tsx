import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deviceApi } from '../services/api';
import { Device } from '../types';

const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newDevice, setNewDevice] = useState({ deviceName: '', deviceType: '' });

  // 获取设备列表
  const fetchDevices = async () => {
    try {
      const response = await deviceApi.getDevices();
      setDevices(response.devices);
      setLoading(false);
    } catch (err: any) {
      setError('获取设备列表失败，请稍后重试');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // 添加新设备
  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await deviceApi.addDevice(newDevice);
      setIsAddModalOpen(false);
      setNewDevice({ deviceName: '', deviceType: '' });
      fetchDevices();
    } catch (err: any) {
      setError('添加设备失败，请稍后重试');
    }
  };

  // 删除设备
  const handleDeleteDevice = async (id: string) => {
    if (window.confirm('确定要删除该设备吗？')) {
      try {
        await deviceApi.deleteDevice(id);
        fetchDevices();
      } catch (err: any) {
        setError('删除设备失败，请稍后重试');
      }
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="device-management">
      <div className="device-management-header">
        <h2>设备管理</h2>
        <button 
          className="add-device-button"
          onClick={() => setIsAddModalOpen(true)}
        >
          添加设备
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="device-list">
        {devices.length === 0 ? (
          <div className="no-devices">
            <p>还没有添加设备</p>
            <button 
              className="add-device-button"
              onClick={() => setIsAddModalOpen(true)}
            >
              添加第一个设备
            </button>
          </div>
        ) : (
          <table className="device-table">
            <thead>
              <tr>
                <th>设备名称</th>
                <th>设备类型</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(device => (
                <tr key={device._id}>
                  <td>{device.deviceName}</td>
                  <td>{device.deviceType}</td>
                  <td>
                    <span className={`status-badge ${device.status}`}>
                      {device.status === 'online' ? '在线' : '离线'}
                    </span>
                  </td>
                  <td>{new Date(device.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="device-actions">
                      <Link 
                        to={`/device/${device._id}`} 
                        className="action-button view"
                      >
                        查看
                      </Link>
                      <button 
                        className="action-button delete"
                        onClick={() => handleDeleteDevice(device._id)}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 添加设备模态框 */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>添加设备</h3>
              <button 
                className="close-button"
                onClick={() => setIsAddModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddDevice}>
              <div className="form-group">
                <label htmlFor="deviceName">设备名称</label>
                <input
                  type="text"
                  id="deviceName"
                  value={newDevice.deviceName}
                  onChange={(e) => setNewDevice({ ...newDevice, deviceName: e.target.value })}
                  required
                  placeholder="请输入设备名称"
                />
              </div>
              <div className="form-group">
                <label htmlFor="deviceType">设备类型</label>
                <input
                  type="text"
                  id="deviceType"
                  value={newDevice.deviceType}
                  onChange={(e) => setNewDevice({ ...newDevice, deviceType: e.target.value })}
                  required
                  placeholder="请输入设备类型"
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

export default DeviceManagement;
