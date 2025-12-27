import React from 'react';
import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';

const ServerError: React.FC = () => {

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: 'calc(100vh - 120px)',
      padding: '24px'
    }}>
      <Result
        status="500"
        title="500"
        subTitle="抱歉，服务器内部错误"
        extra={
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/">
              <Button type="primary" icon={<HomeOutlined />} size="large">
                返回首页
              </Button>
            </Link>
            <Button type="default" icon={<ReloadOutlined />} size="large" onClick={handleReload}>
              刷新页面
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default ServerError;