import React from 'react';
import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const NotFound: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: 'calc(100vh - 120px)',
      padding: '24px'
    }}>
      <Result
        status="404"
        title="404"
        subTitle="抱歉，您访问的页面不存在"
        extra={
          <Link to="/">
            <Button type="primary" icon={<HomeOutlined />} size="large">
              返回首页
            </Button>
          </Link>
        }
      />
    </div>
  );
};

export default NotFound;