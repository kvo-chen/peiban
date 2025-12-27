import React, { useState, useEffect } from 'react';
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
  Result,
  Select
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { deviceGroupApi, deviceApi } from '../services/api';
import type { DeviceGroup, Device } from '../types';

const { Option } = Select;
const { TextArea } = Input;

const DeviceGroupManagement: React.FC = () => {
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroup[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<DeviceGroup | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [addDeviceForm] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  // 获取设备分组列表
  const fetchDeviceGroups = async () => {
    try {
      setLoading(true);
      const response = await deviceGroupApi.getDeviceGroups();
      setDeviceGroups(response.deviceGroups);
    } catch (err: any) {
      message.error('获取设备分组列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 获取所有设备
  const fetchDevices = async () => {
    try {
      const response = await deviceApi.getDevices();
      setDevices(response.devices);
    } catch (err: any) {
      message.error('获取设备列表失败，请稍后重试');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchDeviceGroups(), fetchDevices()]);
    };
    fetchData();
  }, []);

  // 添加设备分组
  const handleAddDeviceGroup = async (values: { name: string; description: string }) => {
    try {
      setConfirmLoading(true);
      await deviceGroupApi.createDeviceGroup(values);
      message.success('设备分组创建成功');
      setIsAddModalOpen(false);
      form.resetFields();
      fetchDeviceGroups();
    } catch (err: any) {
      message.error('创建设备分组失败，请稍后重试');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 打开编辑设备分组模态框
  const handleEditDeviceGroup = (group: DeviceGroup) => {
    setSelectedGroup(group);
    editForm.setFieldsValue({
      name: group.name,
      description: group.description
    });
    setIsEditModalOpen(true);
  };

  // 更新设备分组
  const handleUpdateDeviceGroup = async (values: { name: string; description: string }) => {
    if (!selectedGroup) return;
    
    try {
      setConfirmLoading(true);
      await deviceGroupApi.updateDeviceGroup(selectedGroup.id.toString(), values);
      message.success('设备分组更新成功');
      setIsEditModalOpen(false);
      fetchDeviceGroups();
    } catch (err: any) {
      message.error('更新设备分组失败，请稍后重试');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 删除设备分组
  const handleDeleteDeviceGroup = (group: DeviceGroup) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除设备分组 ${group.name} 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deviceGroupApi.deleteDeviceGroup(group.id.toString());
          message.success('设备分组删除成功');
          fetchDeviceGroups();
        } catch (err: any) {
          message.error('删除设备分组失败，请稍后重试');
        }
      }
    });
  };

  // 打开添加设备到分组模态框
  const handleOpenAddDeviceModal = (group: DeviceGroup) => {
    setSelectedGroup(group);
    setIsAddDeviceModalOpen(true);
  };

  // 添加设备到分组
  const handleAddDeviceToGroup = async (values: { deviceIds: string[] }) => {
    if (!selectedGroup || !values.deviceIds || values.deviceIds.length === 0) return;
    
    try {
      setConfirmLoading(true);
      // 批量添加设备到分组
      for (const deviceId of values.deviceIds) {
        await deviceGroupApi.addDeviceToGroup({
          groupId: selectedGroup.id.toString(),
          deviceId
        });
      }
      message.success(`成功添加 ${values.deviceIds.length} 个设备到分组`);
      setIsAddDeviceModalOpen(false);
      addDeviceForm.resetFields();
      fetchDeviceGroups();
    } catch (err: any) {
      message.error('添加设备到分组失败，请稍后重试');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 从分组移除设备
  const handleRemoveDeviceFromGroup = (group: DeviceGroup, device: Device) => {
    Modal.confirm({
      title: '确认移除',
      content: `确定要从设备分组 ${group.name} 中移除设备 ${device.deviceName} 吗？`,
      okText: '移除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deviceGroupApi.removeDeviceFromGroup({
            groupId: group.id.toString(),
            deviceId: device.id.toString()
          });
          message.success('设备已从分组中移除');
          fetchDeviceGroups();
        } catch (err: any) {
          message.error('移除设备失败，请稍后重试');
        }
      }
    });
  };

  // 表格列配置
  const columns = [
    {
      title: '分组名称',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: DeviceGroup, b: DeviceGroup) => a.name.localeCompare(b.name),
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '设备数量',
      dataIndex: 'devices',
      key: 'deviceCount',
      sorter: (a: DeviceGroup, b: DeviceGroup) => (a.devices?.length || 0) - (b.devices?.length || 0),
      render: (devices: Device[]) => (
        <Tag color="blue">{devices?.length || 0} 个设备</Tag>
      )
    },
    {
      title: '设备列表',
      dataIndex: 'devices',
      key: 'devices',
      render: (devices: Device[], record: DeviceGroup) => {
        if (!devices || devices.length === 0) return <Tag color="default">无</Tag>;
        return (
          <Space wrap>
            {devices.map((device) => (
              <Tag key={device.id} color="cyan">
                {device.deviceName}
                <Button 
                  type="text" 
                  danger 
                  size="small" 
                  style={{ marginLeft: 4, padding: 0, fontSize: 12 }}
                  onClick={() => handleRemoveDeviceFromGroup(record, device)}
                >
                  ×
                </Button>
              </Tag>
            ))}
          </Space>
        );
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DeviceGroup) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditDeviceGroup(record)}
          >
            编辑
          </Button>
          <Button 
            type="primary" 
            icon={<UserAddOutlined />} 
            size="small"
            onClick={() => handleOpenAddDeviceModal(record)}
          >
            添加设备
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDeleteDeviceGroup(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  // 获取可添加到分组的设备选项
  const getAvailableDevices = () => {
    if (!selectedGroup) return [];
    
    const groupDeviceIds = new Set(selectedGroup.devices?.map(device => device.id.toString()) || []);
    return devices.filter(device => !groupDeviceIds.has(device.id.toString()));
  };

  return (
    <div style={{ 
      padding: '24px',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      {/* 页面头部 */}
      <div style={{ marginBottom: '24px' }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <h2 style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: '24px', fontWeight: '600' }}>
            设备分组管理
          </h2>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            管理设备分组，将设备归类到不同分组中
          </p>
        </Space>
      </div>

      {/* 设备分组列表 */}
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
            创建分组
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
        ) : deviceGroups.length === 0 ? (
          <Result
            status="info"
            title="暂无设备分组"
            subTitle="还没有创建任何设备分组，点击下方按钮创建第一个分组"
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
                创建第一个分组
              </Button>
            }
          />
        ) : (
          <Table 
            columns={columns} 
            dataSource={deviceGroups} 
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total) => `共 ${total} 个设备分组`
            }}
            scroll={{ x: 1000 }}
            style={{ backgroundColor: 'var(--color-bg)' }}
            rowHoverable
          />
        )}
      </Card>

      {/* 添加设备分组模态框 */}
      <Modal
        title="创建设备分组"
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
          onFinish={handleAddDeviceGroup}
          initialValues={{
            name: '',
            description: ''
          }}
        >
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>分组名称</span>}
            rules={[
              { required: true, message: '请输入分组名称' },
              { min: 2, message: '分组名称长度不能少于2个字符' },
              { max: 50, message: '分组名称长度不能超过50个字符' }
            ]}
          >
            <Input 
              placeholder="请输入分组名称"
              size="large"
              style={{ height: '48px' }}
            />
          </Form.Item>
          
          <Form.Item
            name="description"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>分组描述</span>}
            rules={[
              { max: 200, message: '分组描述长度不能超过200个字符' }
            ]}
          >
            <TextArea 
              placeholder="请输入分组描述"
              rows={3}
              size="large"
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
                创建分组
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

      {/* 编辑设备分组模态框 */}
      <Modal
        title="编辑设备分组"
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
          onFinish={handleUpdateDeviceGroup}
        >
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>分组名称</span>}
            rules={[
              { required: true, message: '请输入分组名称' },
              { min: 2, message: '分组名称长度不能少于2个字符' },
              { max: 50, message: '分组名称长度不能超过50个字符' }
            ]}
          >
            <Input 
              placeholder="请输入分组名称"
              size="large"
              style={{ height: '48px' }}
            />
          </Form.Item>
          
          <Form.Item
            name="description"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>分组描述</span>}
            rules={[
              { max: 200, message: '分组描述长度不能超过200个字符' }
            ]}
          >
            <TextArea 
              placeholder="请输入分组描述"
              rows={3}
              size="large"
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
                更新分组
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

      {/* 向分组添加设备模态框 */}
      <Modal
        title={`向分组 ${selectedGroup?.name} 添加设备`}
        open={isAddDeviceModalOpen}
        onCancel={() => setIsAddDeviceModalOpen(false)}
        footer={null}
        centered
        width={600}
        closeIcon={false}
      >
        <Form
          form={addDeviceForm}
          layout="vertical"
          onFinish={handleAddDeviceToGroup}
          initialValues={{
            deviceIds: []
          }}
        >
          <Form.Item
            name="deviceIds"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>选择设备</span>}
            rules={[
              { required: true, message: '请选择至少一个设备' },
              { type: 'array', min: 1, message: '请选择至少一个设备' }
            ]}
          >
            <Select
              mode="multiple"
              placeholder="请选择要添加到分组的设备"
              style={{ width: '100%' }}
              size="large"
            >
              {getAvailableDevices().map(device => (
                <Option key={device.id} value={device.id.toString()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{device.deviceName}</span>
                    <Tag color={device.status === 'online' ? 'success' : 'error'}>
                      {device.status === 'online' ? '在线' : '离线'}
                    </Tag>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                    类型：{device.deviceType}
                  </div>
                </Option>
              ))}
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
                添加设备
              </Button>
              <Button 
                onClick={() => setIsAddDeviceModalOpen(false)}
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

export default DeviceGroupManagement;
