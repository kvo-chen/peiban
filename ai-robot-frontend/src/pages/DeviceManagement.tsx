import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Tag, 
  Card, 
  Space, 
  message, 
  Spin,
  Result
} from 'antd';
import { 
  PlusOutlined, 
  EyeOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { deviceApi } from '../services/api';
import type { Device } from '../types';

const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm();

  // 获取设备列表
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await deviceApi.getDevices();
      setDevices(response.devices);
      setError('');
    } catch (err: any) {
      const errorMsg = '获取设备列表失败，请稍后重试';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // 添加新设备
  const handleAddDevice = async (values: { deviceName: string; deviceType: string }) => {
    try {
      await deviceApi.addDevice(values);
      setIsAddModalOpen(false);
      form.resetFields();
      message.success('设备添加成功');
      fetchDevices();
    } catch (err: any) {
      message.error('添加设备失败，请稍后重试');
    }
  };

  // 删除设备
  const handleDeleteDevice = async (id: string | number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该设备吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deviceApi.deleteDevice(id.toString());
          message.success('设备删除成功');
          fetchDevices();
        } catch (err: any) {
          message.error('删除设备失败，请稍后重试');
        }
      }
    });
  };

  // 状态标签配置
  const getStatusTag = (status: string) => {
    const statusConfig = {
      online: {
        color: 'success',
        text: '在线',
        icon: <CheckCircleOutlined />
      },
      offline: {
        color: 'error',
        text: '离线',
        icon: <CloseCircleOutlined />
      },
      unknown: {
        color: 'default',
        text: '未知',
        icon: <CloseCircleOutlined />
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unknown;
    return (
      <Tag 
        color={config.color} 
        icon={config.icon}
        style={{ 
          fontSize: '12px',
          fontWeight: '500',
          padding: '4px 12px',
          borderRadius: '12px',
        }}
      >
        {config.text}
      </Tag>
    );
  };

  // 表格列配置
  const columns = [
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      sorter: (a: Device, b: Device) => a.deviceName.localeCompare(b.deviceName),
      ellipsis: true,
      render: (text: string, record: Device) => (
        <Link to={`/device/${record.id}`} style={{ color: 'var(--color-primary)', fontWeight: '500' }}>
          {text}
        </Link>
      )
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
      sorter: (a: Device, b: Device) => a.deviceType.localeCompare(b.deviceType),
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: '在线', value: 'online' },
        { text: '离线', value: 'offline' },
        { text: '未知', value: 'unknown' }
      ],
      onFilter: (value: any, record: Device) => record.status === value
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a: Device, b: Device) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_text: any, record: Device) => (
        <Space size="middle">
          <Link to={`/device/${record.id}`}>
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              size="middle"
              style={{ fontWeight: '500' }}
            >
              查看
            </Button>
          </Link>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="middle"
            onClick={() => handleDeleteDevice(record.id)}
            style={{ fontWeight: '500' }}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ 
      padding: '24px',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      {/* 页面标题和添加按钮 */}
      <Card 
        style={{ 
          marginBottom: '24px',
          border: 'none',
          boxShadow: 'var(--shadow-sm)',
          backgroundColor: 'var(--color-bg)'
        }}
        bodyStyle={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h1 style={{ 
          fontSize: '28px',
          fontWeight: '700',
          margin: 0,
          color: 'var(--color-text-primary)'
        }}>
          设备管理
        </h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsAddModalOpen(true)}
          size="large"
          style={{ 
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}
        >
          添加设备
        </Button>
      </Card>

      {/* 设备列表 */}
      <Card 
        style={{ 
          border: 'none',
          boxShadow: 'var(--shadow-sm)',
          backgroundColor: 'var(--color-bg)'
        }}
        bodyStyle={{ padding: '0' }}
      >
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '300px' 
          }}>
            <Spin size="large" tip="加载中..." />
          </div>
        ) : error ? (
          <Result
            status="error"
            title="获取设备列表失败"
            subTitle={error}
            extra={
              <Button type="primary" onClick={fetchDevices}>
                重试
              </Button>
            }
          />
        ) : devices.length === 0 ? (
          <Result
            status="info"
            title="暂无设备"
            subTitle="还没有添加任何设备，点击下方按钮添加第一个设备"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                size="large"
                onClick={() => setIsAddModalOpen(true)}
                style={{ 
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                }}
              >
                添加第一个设备
              </Button>
            }
          />
        ) : (
          <Table 
            columns={columns} 
            dataSource={devices} 
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 个设备`,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
            scroll={{ x: 800 }}
            style={{ backgroundColor: 'var(--color-bg)' }}
            rowClassName={() => 'animate-fade-in'}
            rowHoverable
          />
        )}
      </Card>

      {/* 添加设备模态框 */}
      <Modal
        title="添加新设备"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        centered
        width={500}
        closeIcon={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddDevice}
          initialValues={{
            deviceName: '',
            deviceType: ''
          }}
        >
          <Form.Item
            name="deviceName"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>设备名称</span>}
            rules={[
              { required: true, message: '请输入设备名称' },
              { min: 2, message: '设备名称长度不能少于2个字符' },
              { max: 50, message: '设备名称长度不能超过50个字符' }
            ]}
          >
            <Input 
              placeholder="请输入设备名称"
              size="large"
              style={{ height: '48px' }}
            />
          </Form.Item>
          
          <Form.Item
            name="deviceType"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>设备类型</span>}
            rules={[
              { required: true, message: '请输入设备类型' },
              { min: 2, message: '设备类型长度不能少于2个字符' },
              { max: 30, message: '设备类型长度不能超过30个字符' }
            ]}
          >
            <Input 
              placeholder="请输入设备类型"
              size="large"
              style={{ height: '48px' }}
            />
          </Form.Item>
          
          <Form.Item style={{ marginTop: '24px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                block
                style={{ 
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                }}
              >
                添加设备
              </Button>
              <Button 
                onClick={() => setIsAddModalOpen(false)}
                size="large"
                block
                style={{ height: '48px', fontSize: '16px', fontWeight: '600' }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DeviceManagement;
