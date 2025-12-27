import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Table, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Tag, 
  Space, 
  message, 
  Spin, 
  Result,
  List, 
  Avatar,
  Typography
} from 'antd';
import { 
  ArrowLeftOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  RobotOutlined,
  SendOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { deviceApi, actionApi, deviceActionApi, chatApi } from '../services/api';
import type { Device, Action, DeviceAction, ChatRequest, Conversation } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const DeviceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [device, setDevice] = useState<Device | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [deviceActions, setDeviceActions] = useState<DeviceAction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editForm] = Form.useForm();
  const [form] = Form.useForm();
  const [chatMessage, setChatMessage] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sending, setSending] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  // 获取设备详情
  const fetchDeviceDetail = async () => {
    if (!id) return;
    
    try {
      const response = await deviceApi.getDevice(id);
      setDevice({
        ...response.device,
        userId: 1 // 暂时使用默认值，后续从API获取真实userId
      });
    } catch (err: any) {
      message.error('获取设备详情失败，请稍后重试');
    }
  };

  // 打开编辑设备模态框
  const handleEditDevice = () => {
    if (device) {
      editForm.setFieldsValue({
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        status: device.status
      });
      setIsEditModalOpen(true);
    }
  };

  // 更新设备信息
  const handleUpdateDevice = async (values: { deviceName: string; deviceType: string; status: 'online' | 'offline' }) => {
    if (!id) return;
    
    try {
      setConfirmLoading(true);
      await deviceApi.updateDevice(id, values);
      message.success('设备信息更新成功');
      setIsEditModalOpen(false);
      fetchDeviceDetail();
    } catch (err: any) {
      message.error('更新设备信息失败，请稍后重试');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 更改设备状态
  const handleChangeStatus = async (status: 'online' | 'offline') => {
    if (!id || !device) return;
    
    try {
      await deviceApi.updateDevice(id, { status });
      message.success(`设备状态已更新为${status === 'online' ? '在线' : '离线'}`);
      setDevice(prev => prev ? { ...prev, status } : null);
    } catch (err: any) {
      message.error('更新设备状态失败，请稍后重试');
    }
  };

  // 删除设备
  const handleDeleteDevice = () => {
    if (!id || !device) return;
    
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除设备 ${device.deviceName} 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deviceApi.deleteDevice(id);
          message.success('设备删除成功');
          // 返回设备列表页面
          window.location.href = '/';
        } catch (err: any) {
          message.error('删除设备失败，请稍后重试');
        }
      }
    });
  };

  // 获取所有动作
  const fetchActions = async () => {
    try {
      const response = await actionApi.getActions();
      setActions(response.actions);
    } catch (err: any) {
      message.error('获取动作列表失败，请稍后重试');
    }
  };

  // 获取设备的动作映射
  const fetchDeviceActions = async () => {
    if (!id) return;
    
    try {
      const response = await deviceActionApi.getDeviceActions(id);
      setDeviceActions(response.deviceActions);
    } catch (err: any) {
      message.error('获取设备动作映射失败，请稍后重试');
    }
  };

  // 获取对话历史
  const fetchChatHistory = async () => {
    if (!id) return;
    
    try {
      const response = await chatApi.getChatHistory(id);
      setConversations(response.conversations.reverse());
    } catch (err: any) {
      message.error('获取对话历史失败，请稍后重试');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
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

  // 滚动到聊天底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversations]);

  // 添加设备动作映射
  const handleAddDeviceAction = async (values: { actionId: string; prompt: string }) => {
    if (!id) return;
    
    try {
      await deviceActionApi.addDeviceAction({
        deviceId: id,
        actionId: values.actionId,
        prompt: values.prompt
      });
      
      setIsAddModalOpen(false);
      form.resetFields();
      message.success('动作映射添加成功');
      fetchDeviceActions();
    } catch (err: any) {
      message.error('添加设备动作映射失败，请稍后重试');
    }
  };

  // 删除设备动作映射
  const handleDeleteDeviceAction = async (deviceActionId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该动作映射吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deviceActionApi.deleteDeviceAction(deviceActionId);
          message.success('动作映射删除成功');
          fetchDeviceActions();
        } catch (err: any) {
          message.error('删除设备动作映射失败，请稍后重试');
        }
      }
    });
  };

  // 发送AI对话消息
  const handleSendMessage = async () => {
    if (!id || !chatMessage.trim()) return;
    
    try {
      setSending(true);
      const chatRequest: ChatRequest = {
        deviceId: id,
        message: chatMessage.trim()
      };
      
      const response = await chatApi.sendMessage(chatRequest);
      
      // 更新对话历史
      setConversations(prev => [...prev, response.conversation]);
      setChatMessage('');
    } catch (err: any) {
      message.error('发送消息失败，请稍后重试');
    } finally {
      setSending(false);
    }
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
          fontSize: '14px',
          fontWeight: '500',
          padding: '4px 12px',
          borderRadius: '12px',
        }}
      >
        {config.text}
      </Tag>
    );
  };

  // 设备动作映射表格列配置
  const deviceActionColumns = [
    {
      title: '动作名称',
      dataIndex: 'actionId',
      key: 'actionId',
      render: (action: Action) => (
        <Text strong>{action.name}</Text>
      )
    },
    {
      title: '动作描述',
      dataIndex: 'actionId',
      key: 'description',
      render: (action: Action) => (
        <Text type="secondary">{action.description}</Text>
      )
    },
    {
      title: '触发提示词',
      dataIndex: 'prompt',
      key: 'prompt',
      ellipsis: true
    },
    {
      title: '动作时长',
      dataIndex: 'actionId',
      key: 'duration',
      render: (action: Action) => (
        <Tag color="blue">{action.duration}秒</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_text: any, record: DeviceAction) => (
        <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDeleteDeviceAction(String(record.id))}
          >
            删除
          </Button>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 120px)' 
      }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!device) {
    return (
      <Result
        status="404"
        title="设备不存在"
        subTitle="该设备可能已被删除或不存在"
        extra={
          <Link to="/">
            <Button type="primary" icon={<ArrowLeftOutlined />}>
              返回设备列表
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div style={{ 
      padding: '24px',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      {/* 页面头部 */}
      <div style={{ marginBottom: '24px' }}>
        <Row align="middle" gutter={[16, 16]}>
          <Col>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ArrowLeftOutlined /> 
              <Text strong>返回设备列表</Text>
            </Link>
            <Title level={2} style={{ margin: 0, color: 'var(--color-text-primary)' }}>
              {device.deviceName}
            </Title>
          </Col>
          <Col>
            <Space>
              <Button type="primary" onClick={handleEditDevice} style={{ fontWeight: '600' }}>
                编辑设备
              </Button>
              <Button 
                type="primary" 
                danger={device.status === 'online'} 
                onClick={() => handleChangeStatus(device.status === 'online' ? 'offline' : 'online')} 
                style={{ fontWeight: '600' }}
              >
                {device.status === 'online' ? '设为离线' : '设为在线'}
              </Button>
              <Button 
                danger 
                onClick={handleDeleteDevice} 
                style={{ fontWeight: '600' }}
              >
                删除设备
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <div style={{ marginBottom: '24px' }}>
        {/* 设备基本信息卡片 */}
        <Card 
          style={{ 
            marginBottom: '24px',
            border: 'none',
            boxShadow: 'var(--shadow-sm)',
            backgroundColor: 'var(--color-bg)'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={8}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '16px', 
                  backgroundColor: 'var(--color-primary-light)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <RobotOutlined style={{ fontSize: '40px', color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <Title level={3} style={{ margin: 0 }}>{device.deviceName}</Title>
                  <Text type="secondary">{device.deviceType}</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                height: '100%'
              }}>
                <Text strong style={{ fontSize: '14px', marginBottom: '8px' }}>设备状态</Text>
                {getStatusTag(device.status)}
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                height: '100%'
              }}>
                <Text strong style={{ fontSize: '14px', marginBottom: '8px' }}>创建时间</Text>
                <Text>{new Date(device.createdAt).toLocaleString()}</Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 设备动作配置 */}
        <Card 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>设备动作配置</span>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                size="middle"
                onClick={() => setIsAddModalOpen(true)}
                style={{ fontWeight: '500' }}
              >
                添加动作映射
              </Button>
            </div>
          }
          style={{ 
            marginBottom: '24px',
            border: 'none',
            boxShadow: 'var(--shadow-sm)',
            backgroundColor: 'var(--color-bg)'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          {deviceActions.length === 0 ? (
            <Result
              status="info"
              title="暂无动作映射"
              subTitle="还没有为该设备添加动作映射，点击下方按钮添加第一个映射"
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddModalOpen(true)}
                >
                  添加第一个动作映射
                </Button>
              }
            />
          ) : (
            <Table 
              columns={deviceActionColumns} 
              dataSource={deviceActions} 
              rowKey="_id"
              pagination={false}
              scroll={{ x: 800 }}
              style={{ backgroundColor: 'var(--color-bg)' }}
            />
          )}
        </Card>

        {/* AI对话 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageOutlined /> AI对话
            </div>
          }
          style={{ 
            marginBottom: '24px',
            border: 'none',
            boxShadow: 'var(--shadow-sm)',
            backgroundColor: 'var(--color-bg)'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <div 
            ref={chatContainerRef}
            style={{ 
              height: '400px', 
              overflowY: 'auto', 
              padding: '16px', 
              backgroundColor: 'var(--color-bg-light)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              border: '1px solid var(--color-border)'
            }}
          >
            {conversations.length === 0 ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                color: 'var(--color-text-tertiary)'
              }}>
                <RobotOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                <Text type="secondary">还没有对话记录</Text>
                <Text type="secondary">开始和你的机器人聊天吧！</Text>
              </div>
            ) : (
              <List
                dataSource={conversations}
                renderItem={(item) => (
                  <List.Item key={item.id} style={{ padding: '8px 0', animation: 'fadeIn var(--transition-fast) ease-out' }}>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<UserOutlined />} 
                          style={{ 
                            backgroundColor: 'var(--color-primary)',
                            transition: 'all var(--transition-fast)',
                            transform: 'scale(1)',
                          }} 
                        />
                      }
                      title={
                        <div style={{ marginBottom: '8px', opacity: 0, animation: 'fadeIn var(--transition-fast) ease-out 0.1s forwards' }}>
                          <Text strong>你：</Text>
                          <Text>{item.message}</Text>
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ marginBottom: '4px', opacity: 0, animation: 'fadeIn var(--transition-fast) ease-out 0.2s forwards' }}>
                            <Text strong>AI：</Text>
                            <Text>{item.response}</Text>
                          </div>
                          {item.actionTriggered && (
                            <div style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              marginTop: '4px',
                              padding: '2px 8px',
                              backgroundColor: 'var(--color-warning-light)',
                              color: 'var(--color-warning)',
                              borderRadius: '12px',
                              fontSize: '12px',
                              opacity: 0,
                              animation: 'fadeIn var(--transition-fast) ease-out 0.3s forwards',
                              transition: 'all var(--transition-fast)',
                            }}>
                              <RobotOutlined /> 触发动作
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
          
          <Form
            layout="vertical"
            onFinish={handleSendMessage}
          >
            <Row gutter={[16, 16]} align="bottom">
              <Col flex={1}>
                <Form.Item
                  name="message"
                  rules={[{ required: true, message: '请输入消息内容' }]}
                >
                  <TextArea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="输入消息..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    onPressEnter={() => handleSendMessage()}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Button 
                  type="primary" 
                  icon={<SendOutlined />} 
                  size="large"
                  onClick={handleSendMessage}
                  loading={sending}
                  disabled={!chatMessage.trim()}
                  style={{ 
                    height: '40px',
                    fontWeight: '600'
                  }}
                >
                  发送
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>

      {/* 添加动作映射模态框 */}
      <Modal
        title="添加动作映射"
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
          onFinish={handleAddDeviceAction}
          initialValues={{
            actionId: '',
            prompt: ''
          }}
        >
          <Form.Item
            name="actionId"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>选择动作</span>}
            rules={[{ required: true, message: '请选择一个动作' }]}
          >
            <Select 
              placeholder="请选择动作"
              size="large"
              style={{ width: '100%', height: '48px' }}
            >
              {actions.map(action => (
                <Option key={action.id} value={action.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{action.name}</span>
                    <Tag color="blue">{action.duration}秒</Tag>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                    {action.description}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="prompt"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>触发提示词</span>}
            rules={[
              { required: true, message: '请输入触发提示词' },
              { min: 2, message: '提示词长度不能少于2个字符' },
              { max: 100, message: '提示词长度不能超过100个字符' }
            ]}
          >
            <Input 
              placeholder="例如：前进、左转、趴下等"
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
                  fontWeight: '600'
                }}
              >
                添加动作映射
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

      {/* 编辑设备模态框 */}
      <Modal
        title="编辑设备信息"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        centered
        width={500}
        closeIcon={false}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateDevice}
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
          
          <Form.Item
            name="status"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>设备状态</span>}
            rules={[{ required: true, message: '请选择设备状态' }]}
          >
            <Select 
              placeholder="请选择设备状态"
              size="large"
              style={{ height: '48px' }}
            >
              <Option value="online">在线</Option>
              <Option value="offline">离线</Option>
            </Select>
          </Form.Item>
          
          <Form.Item style={{ marginTop: '24px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                block
                loading={confirmLoading}
                style={{ 
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                更新设备信息
              </Button>
              <Button 
                onClick={() => setIsEditModalOpen(false)}
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

export default DeviceDetail;