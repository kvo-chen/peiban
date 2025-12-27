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
  Result,
  Select,
  Checkbox,
  Radio,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  DeleteRowOutlined
} from '@ant-design/icons';
import { deviceApi } from '../services/api';
import type { Device } from '../types';

const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm();
  // 搜索和过滤状态
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>('');
  // 批量操作状态
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<number[]>([]);
  const [isBatchActionModalOpen, setIsBatchActionModalOpen] = useState<boolean>(false);
  const [batchAction, setBatchAction] = useState<'delete' | 'update-status'>('delete');
  const [targetStatus, setTargetStatus] = useState<'online' | 'offline'>('online');
  // 分页状态
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalDevices, setTotalDevices] = useState<number>(0);

  // 获取设备列表
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await deviceApi.getDevices({
        search: searchText,
        status: statusFilter,
        deviceType: deviceTypeFilter,
        page: currentPage,
        limit: pageSize
      });
      setDevices(response.devices);
      setTotalDevices(response.total);
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
  }, [searchText, statusFilter, deviceTypeFilter, currentPage, pageSize]);

  // 批量删除设备
  const handleBatchDelete = async () => {
    try {
      await deviceApi.batchDeleteDevices(selectedDeviceIds);
      message.success(`成功删除 ${selectedDeviceIds.length} 个设备`);
      setSelectedDeviceIds([]);
      setIsBatchActionModalOpen(false);
      fetchDevices();
    } catch (err: any) {
      message.error('批量删除失败，请稍后重试');
    }
  };

  // 批量更新设备状态
  const handleBatchUpdateStatus = async () => {
    try {
      await deviceApi.batchUpdateDevicesStatus(selectedDeviceIds, targetStatus);
      message.success(`成功更新 ${selectedDeviceIds.length} 个设备状态`);
      setSelectedDeviceIds([]);
      setIsBatchActionModalOpen(false);
      fetchDevices();
    } catch (err: any) {
      message.error('批量更新状态失败，请稍后重试');
    }
  };

  // 处理批量操作提交
  const handleBatchActionSubmit = () => {
    if (batchAction === 'delete') {
      handleBatchDelete();
    } else {
      handleBatchUpdateStatus();
    }
  };

  // 重置搜索和过滤条件
  const handleResetFilters = () => {
    setSearchText('');
    setStatusFilter('');
    setDeviceTypeFilter('');
    setCurrentPage(1);
  };

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
        <Space>
          {/* 批量操作按钮 */}
          {selectedDeviceIds.length > 0 && (
            <Popconfirm
              title={`确定要对选中的 ${selectedDeviceIds.length} 个设备执行操作吗？`}
              onConfirm={() => setIsBatchActionModalOpen(true)}
              okText="确认"
              cancelText="取消"
              placement="bottom"
            >
              <Button 
                type="primary" 
                icon={<DeleteRowOutlined />} 
                size="large"
                style={{ 
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  backgroundColor: '#ef4444',
                  borderColor: '#ef4444'
                }}
              >
                批量操作
              </Button>
            </Popconfirm>
          )}
          {/* 添加设备按钮 */}
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
        </Space>
      </Card>

      {/* 搜索和过滤区域 */}
      <Card 
        style={{ 
          marginBottom: '24px',
          border: 'none',
          boxShadow: 'var(--shadow-sm)',
          backgroundColor: 'var(--color-bg)'
        }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="搜索设备名称或类型"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              style={{ minWidth: '300px' }}
            />
            <Select
              placeholder="状态"
              value={statusFilter}
              onChange={setStatusFilter}
              size="large"
              style={{ minWidth: '150px' }}
              allowClear
            >
              <Select.Option value="online">在线</Select.Option>
              <Select.Option value="offline">离线</Select.Option>
            </Select>
            <Select
              placeholder="设备类型"
              value={deviceTypeFilter}
              onChange={setDeviceTypeFilter}
              size="large"
              style={{ minWidth: '150px' }}
              allowClear
            >
              {/* 动态生成设备类型选项 */}
              {Array.from(new Set(devices.map(d => d.deviceType))).map(type => (
                <Select.Option key={type} value={type}>{type}</Select.Option>
              ))}
            </Select>
            <Button 
              icon={<SearchOutlined />} 
              onClick={fetchDevices}
              size="large"
              type="primary"
            >
              搜索
            </Button>
            <Button 
              icon={<FilterOutlined />} 
              onClick={handleResetFilters}
              size="large"
            >
              重置
            </Button>
          </Space.Compact>
        </Space>
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
            columns={[
              {
                title: (
                  <Checkbox
                    checked={selectedDeviceIds.length === devices.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDeviceIds(devices.map(d => d.id));
                      } else {
                        setSelectedDeviceIds([]);
                      }
                    }}
                  />
                ),
                key: 'checkbox',
                render: (_: any, record: Device) => (
                  <Checkbox
                    checked={selectedDeviceIds.includes(record.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDeviceIds([...selectedDeviceIds, record.id]);
                      } else {
                        setSelectedDeviceIds(selectedDeviceIds.filter(id => id !== record.id));
                      }
                    }}
                  />
                ),
                width: 60,
                fixed: 'left'
              },
              ...columns
            ]} 
            dataSource={devices} 
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 个设备`,
              pageSizeOptions: ['10', '20', '50', '100'],
              total: totalDevices,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              onShowSizeChange: (_, size) => {
                setCurrentPage(1);
                setPageSize(size);
              }
            }}
            scroll={{ x: 900 }}
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

      {/* 批量操作模态框 */}
      <Modal
        title="批量操作"
        open={isBatchActionModalOpen}
        onCancel={() => setIsBatchActionModalOpen(false)}
        footer={null}
        centered
        width={500}
        closeIcon={false}
      >
        <Form
          layout="vertical"
          onFinish={handleBatchActionSubmit}
          initialValues={{
            batchAction: 'delete',
            targetStatus: 'online'
          }}
        >
          <Form.Item
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>操作类型</span>}
            name="batchAction"
          >
            <Radio.Group 
              value={batchAction} 
              onChange={(e) => setBatchAction(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="delete">批量删除</Radio.Button>
              <Radio.Button value="update-status">批量更新状态</Radio.Button>
            </Radio.Group>
          </Form.Item>
          
          {batchAction === 'update-status' && (
            <Form.Item
              label={<span style={{ fontWeight: '600', fontSize: '14px' }}>目标状态</span>}
              name="targetStatus"
              rules={[{ required: true, message: '请选择目标状态' }]}
            >
              <Radio.Group 
                value={targetStatus} 
                onChange={(e) => setTargetStatus(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="online">在线</Radio.Button>
                <Radio.Button value="offline">离线</Radio.Button>
              </Radio.Group>
            </Form.Item>
          )}
          
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
                  boxShadow: batchAction === 'delete' 
                    ? '0 4px 12px rgba(239, 68, 68, 0.3)'
                    : '0 4px 12px rgba(16, 185, 129, 0.3)',
                  backgroundColor: batchAction === 'delete' ? '#ef4444' : '#10b981',
                  borderColor: batchAction === 'delete' ? '#ef4444' : '#10b981'
                }}
              >
                {batchAction === 'delete' ? '批量删除' : '批量更新状态'}
              </Button>
              <Button 
                onClick={() => setIsBatchActionModalOpen(false)}
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
