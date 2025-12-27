import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Spin, Pagination, Tag, Space } from 'antd';
import { ClockCircleOutlined, UserOutlined, InfoCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { logApi } from '../services/api';

const { Title } = Typography;

// 日志数据类型定义
interface OperationLog {
  id: number;
  user_id: number;
  username: string;
  operation: string;
  module: string;
  ip: string;
  user_agent: string;
  status: 'success' | 'failed';
  details: string;
  created_at: string;
}

const Logs: React.FC = () => {
  // 日志数据
  const [logs, setLogs] = useState<OperationLog[]>([]);
  // 加载状态
  const [loading, setLoading] = useState<boolean>(true);
  // 分页信息
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 获取日志数据
  const fetchLogs = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const response = await logApi.getOperationLogs(page, pageSize);
      setLogs(response.logs);
      setPagination({
        ...pagination,
        current: page,
        pageSize,
        total: response.total,
      });
    } catch (error) {
      console.error('获取日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和分页变化时重新获取数据
  useEffect(() => {
    fetchLogs(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  // 处理分页变化
  const handlePageChange = (page: number, pageSize: number) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize,
    });
  };

  // 表格列配置
  const columns = [
    {
      title: '操作时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#3b82f6' }} />
          <span>{new Date(text).toLocaleString()}</span>
        </Space>
      ),
      sorter: (a: OperationLog, b: OperationLog) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: '操作人',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => (
        <Space>
          <UserOutlined style={{ color: '#10b981' }} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      render: (text: string) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (text: string) => (
        <Space>
          <InfoCircleOutlined style={{ color: '#f59e0b' }} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'success' | 'failed') => (
        <Tag color={status === 'success' ? 'success' : 'error'}>
          {status === 'success' ? (
            <Space>
              <CheckCircleOutlined />
              成功
            </Space>
          ) : (
            <Space>
              <CloseCircleOutlined />
              失败
            </Space>
          )}
        </Tag>
      ),
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: '详细信息',
      dataIndex: 'details',
      key: 'details',
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <span title={text}>{text}</span>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', animation: 'fadeIn 0.5s ease-out' }}>
      {/* 页面标题 */}
      <Title level={2} style={{ marginBottom: '24px', color: 'var(--color-text-primary)' }}>
        操作日志
      </Title>

      {/* 日志表格 */}
      <Card 
        style={{
          border: 'none',
          boxShadow: 'var(--shadow-sm)',
          backgroundColor: 'var(--color-bg)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <Spin spinning={loading} tip="加载日志中...">
          <Table
            columns={columns}
            dataSource={logs}
            rowKey="id"
            pagination={false}
            scroll={{ x: 800 }}
            bordered={false}
            style={{ marginBottom: '16px' }}
          />
          
          {/* 分页控件 */}
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={handlePageChange}
            showSizeChanger
            pageSizeOptions={['10', '20', '50', '100']}
            showTotal={(total) => `共 ${total} 条日志`}
            style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default Logs;