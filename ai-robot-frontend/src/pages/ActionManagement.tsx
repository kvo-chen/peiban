import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Card,
  Space,
  message,
  Spin,
  Result
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { actionApi } from '../services/api';
import type { Action } from '../types';

const { Option } = Select;
const { TextArea } = Input;

const ActionManagement: React.FC = () => {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  // 获取所有动作
  const fetchActions = async () => {
    try {
      setLoading(true);
      const response = await actionApi.getActions();
      setActions(response.actions);
    } catch (err: any) {
      message.error('获取动作列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  // 添加动作
  const handleAddAction = async (values: { name: string; description: string; type: 'basic' | 'custom'; duration: number; steps: string[] }) => {
    try {
      setConfirmLoading(true);
      await actionApi.createAction(values);
      message.success('动作创建成功');
      setIsAddModalOpen(false);
      form.resetFields();
      fetchActions();
    } catch (err: any) {
      message.error('创建动作失败，请稍后重试');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 打开编辑动作模态框
  const handleEditAction = (action: Action) => {
    setSelectedAction(action);
    editForm.setFieldsValue({
      name: action.name,
      description: action.description,
      type: action.type,
      duration: action.duration,
      steps: action.steps
    });
    setIsEditModalOpen(true);
  };

  // 更新动作
  const handleUpdateAction = async (values: { name: string; description: string; type: 'basic' | 'custom'; duration: number; steps: string[] }) => {
    if (!selectedAction) return;
    
    try {
      setConfirmLoading(true);
      await actionApi.updateAction(selectedAction.id.toString(), values);
      message.success('动作更新成功');
      setIsEditModalOpen(false);
      fetchActions();
    } catch (err: any) {
      message.error('更新动作失败，请稍后重试');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 删除动作
  const handleDeleteAction = (action: Action) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除动作 ${action.name} 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await actionApi.deleteAction(action.id.toString());
          message.success('动作删除成功');
          fetchActions();
        } catch (err: any) {
          message.error('删除动作失败，请稍后重试');
        }
      }
    });
  };

  // 表格列配置
  const columns = [
    {
      title: '动作名称',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Action, b: Action) => a.name.localeCompare(b.name),
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: '动作类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeConfig = {
          basic: { color: 'blue', text: '基本动作' },
          custom: { color: 'green', text: '自定义动作' }
        };
        const config = typeConfig[type as keyof typeof typeConfig] || { color: 'default', text: '未知类型' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '时长 (秒)',
      dataIndex: 'duration',
      key: 'duration',
      sorter: (a: Action, b: Action) => a.duration - b.duration,
      render: (duration: number) => <Tag color="purple">{duration}</Tag>
    },
    {
      title: '步骤',
      dataIndex: 'steps',
      key: 'steps',
      render: (steps: string[]) => {
        if (!Array.isArray(steps)) return <Tag color="default">无</Tag>;
        return (
          <Space wrap>
            {steps.map((step, index) => (
              <Tag key={index} color="cyan">{step}</Tag>
            ))}
          </Space>
        );
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a: Action, b: Action) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: Date) => new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Action) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditAction(record)}
          >
            编辑
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDeleteAction(record)}
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
      {/* 页面头部 */}
      <div style={{ marginBottom: '24px' }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <h2 style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: '24px', fontWeight: '600' }}>
            动作管理
          </h2>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            管理机器人的动作库，包括基本动作和自定义动作
          </p>
        </Space>
      </div>

      {/* 动作列表 */}
      <Card 
        style={{ 
          border: 'none',
          boxShadow: 'var(--shadow-sm)',
          backgroundColor: 'var(--color-bg)'
        }}
        bodyStyle={{ padding: '24px' }}
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
            添加动作
          </Button>
        }
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
        ) : actions.length === 0 ? (
          <Result
            status="info"
            title="暂无动作"
            subTitle="还没有添加任何动作，点击下方按钮添加第一个动作"
            extra={
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
                添加第一个动作
              </Button>
            }
          />
        ) : (
          <Table 
            columns={columns} 
            dataSource={actions} 
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total) => `共 ${total} 个动作`
            }}
            scroll={{ x: 1000 }}
            style={{ backgroundColor: 'var(--color-bg)' }}
            rowHoverable
          />
        )}
      </Card>

      {/* 添加动作模态框 */}
      <Modal
        title="添加动作"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        centered
        width={600}
        closeIcon={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddAction}
          initialValues={{
            type: 'custom',
            duration: 1,
            steps: []
          }}
        >
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>动作名称</span>}
            rules={[
              { required: true, message: '请输入动作名称' },
              { min: 2, message: '动作名称长度不能少于2个字符' },
              { max: 50, message: '动作名称长度不能超过50个字符' }
            ]}
          >
            <Input 
              placeholder="请输入动作名称"
              size="large"
              style={{ height: '48px' }}
            />
          </Form.Item>
          
          <Form.Item
            name="type"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>动作类型</span>}
            rules={[{ required: true, message: '请选择动作类型' }]}
          >
            <Select 
              placeholder="请选择动作类型"
              size="large"
              style={{ width: '100%', height: '48px' }}
            >
              <Option value="basic">基本动作</Option>
              <Option value="custom">自定义动作</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>动作描述</span>}
            rules={[
              { required: true, message: '请输入动作描述' },
              { min: 5, message: '动作描述长度不能少于5个字符' },
              { max: 200, message: '动作描述长度不能超过200个字符' }
            ]}
          >
            <TextArea 
              placeholder="请输入动作描述"
              rows={3}
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            name="duration"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>动作时长 (秒)</span>}
            rules={[
              { required: true, message: '请输入动作时长' },
              { type: 'number', min: 0.1, max: 3, message: '动作时长必须在0.1-3秒之间' }
            ]}
          >
            <InputNumber 
              placeholder="请输入动作时长"
              size="large"
              style={{ width: '100%', height: '48px' }}
              min={0.1}
              max={3}
              step={0.1}
            />
          </Form.Item>
          
          <Form.Item
            name="steps"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>动作步骤</span>}
          >
            <Select 
              mode="tags"
              placeholder="请输入动作步骤，按回车添加"
              size="large"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
            />
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
                添加动作
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

      {/* 编辑动作模态框 */}
      <Modal
        title="编辑动作"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        centered
        width={600}
        closeIcon={false}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateAction}
        >
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>动作名称</span>}
            rules={[
              { required: true, message: '请输入动作名称' },
              { min: 2, message: '动作名称长度不能少于2个字符' },
              { max: 50, message: '动作名称长度不能超过50个字符' }
            ]}
          >
            <Input 
              placeholder="请输入动作名称"
              size="large"
              style={{ height: '48px' }}
            />
          </Form.Item>
          
          <Form.Item
            name="type"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>动作类型</span>}
            rules={[{ required: true, message: '请选择动作类型' }]}
          >
            <Select 
              placeholder="请选择动作类型"
              size="large"
              style={{ width: '100%', height: '48px' }}
            >
              <Option value="basic">基本动作</Option>
              <Option value="custom">自定义动作</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>动作描述</span>}
            rules={[
              { required: true, message: '请输入动作描述' },
              { min: 5, message: '动作描述长度不能少于5个字符' },
              { max: 200, message: '动作描述长度不能超过200个字符' }
            ]}
          >
            <TextArea 
              placeholder="请输入动作描述"
              rows={3}
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            name="duration"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>动作时长 (秒)</span>}
            rules={[
              { required: true, message: '请输入动作时长' },
              { type: 'number', min: 0.1, max: 3, message: '动作时长必须在0.1-3秒之间' }
            ]}
          >
            <InputNumber 
              placeholder="请输入动作时长"
              size="large"
              style={{ width: '100%', height: '48px' }}
              min={0.1}
              max={3}
              step={0.1}
            />
          </Form.Item>
          
          <Form.Item
            name="steps"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>动作步骤</span>}
          >
            <Select 
              mode="tags"
              placeholder="请输入动作步骤，按回车添加"
              size="large"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
            />
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
                更新动作
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

export default ActionManagement;
