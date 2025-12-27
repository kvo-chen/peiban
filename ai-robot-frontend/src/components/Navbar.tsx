import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Drawer, Space } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  RobotOutlined, 
  BarChartOutlined, 
  SettingOutlined,
  MenuOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import { authApi } from '../services/api';

const { Header } = Layout;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  
  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };
  
  // 获取当前路径对应的菜单项key
  const getCurrentKey = () => {
    const path = location.pathname;
    if (path === '/') return 'devices';
    if (path === '/analysis') return 'analysis';
    if (path === '/logs') return 'logs';
    if (path === '/settings') return 'settings';
    if (path === '/login') return 'login';
    if (path === '/register') return 'register';
    return '';
  };
  
  // 导航菜单配置
  const navMenu = [
    { key: 'devices', label: '设备管理', icon: <UserOutlined />, path: '/' },
    { key: 'analysis', label: '数据分析', icon: <BarChartOutlined />, path: '/analysis' },
    { key: 'logs', label: '操作日志', icon: <ClockCircleOutlined />, path: '/logs' },
    { key: 'settings', label: '个性化设置', icon: <SettingOutlined />, path: '/settings' },
  ];
  
  const authMenu = [
    { key: 'login', label: '登录', path: '/login' },
    { key: 'register', label: '注册', path: '/register' },
  ];
  
  return (
    <Header style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      backgroundColor: 'var(--color-primary)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      padding: '0 24px',
      height: '64px',
      lineHeight: '64px',
      transition: 'all var(--transition-normal)'
    }}>
      {/* 品牌标识 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        transition: 'transform var(--transition-fast)',
      }} onClick={() => navigate('/')}>
        <RobotOutlined style={{ 
          color: 'white', 
          fontSize: '28px', 
          transition: 'transform var(--transition-fast)',
        }} />
        <Link to="/" style={{ 
          color: 'white', 
          fontSize: '20px', 
          fontWeight: '600', 
          textDecoration: 'none',
          letterSpacing: '0.5px',
        }}>
          AI陪伴机器人
        </Link>
      </div>
      
      {/* 桌面端菜单 */}
      <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', maxWidth: '800px' }} className="desktop-menu">
        {token ? (
          <Menu 
            theme="dark" 
            mode="horizontal" 
            selectedKeys={[getCurrentKey()]} 
            items={[
              ...navMenu.map(item => ({
                key: item.key,
                icon: item.icon,
                label: (
                  <Link to={item.path} style={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all var(--transition-fast)',
                  }}>
                    {item.label}
                  </Link>
                )
              })),
              {
                key: 'logout',
                label: (
                  <Button 
                    type="text" 
                    icon={<LogoutOutlined />} 
                    onClick={handleLogout} 
                    style={{ 
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                    size="middle"
                  >
                    退出登录
                  </Button>
                )
              }
            ]}
            style={{ 
              flex: 1, 
              backgroundColor: 'transparent', 
              borderBottom: 'none',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '16px',
            }}
          />
        ) : (
          <Menu 
            theme="dark" 
            mode="horizontal" 
            selectedKeys={[getCurrentKey()]} 
            items={authMenu.map(item => ({
              key: item.key,
              label: (
                <Link to={item.path} style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                }}>
                  {item.label}
                </Link>
              ),
              style: {
                borderRadius: 'var(--radius-sm)',
                margin: '0 4px',
                transition: 'all var(--transition-fast)',
              }
            }))}
            style={{ 
              flex: 1, 
              marginLeft: 'auto', 
              backgroundColor: 'transparent', 
              borderBottom: 'none',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '16px',
            }}
          />
        )}
      </div>
      
      {/* 移动端菜单按钮 */}
      <Button 
        type="text" 
        icon={<MenuOutlined />} 
        style={{ 
          color: 'white',
          display: 'block',
          fontSize: '20px',
        }}
        onClick={() => setDrawerVisible(true)}
        className="mobile-menu-btn"
      />
      
      {/* 移动端抽屉菜单 */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RobotOutlined style={{ color: 'var(--color-primary)' }} />
            <span>AI陪伴机器人</span>
          </div>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        size={280}
      >
        {token ? (
          <Space direction="vertical" style={{ width: '100%', marginTop: '16px' }}>
            {navMenu.map(item => (
              <Link 
                key={item.key} 
                to={item.path} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: getCurrentKey() === item.key ? 'var(--color-primary-light)' : 'transparent',
                  color: getCurrentKey() === item.key ? 'var(--color-primary)' : 'inherit',
                  fontWeight: getCurrentKey() === item.key ? '600' : 'normal',
                  transition: 'all var(--transition-fast)',
                }}
                onClick={() => setDrawerVisible(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <Button 
              type="primary" 
              icon={<LogoutOutlined />} 
              onClick={() => {
                handleLogout();
                setDrawerVisible(false);
              }} 
              block
              style={{ marginTop: '24px' }}
            >
              退出登录
            </Button>
          </Space>
        ) : (
          <Space direction="vertical" style={{ width: '100%', marginTop: '16px' }}>
            {authMenu.map(item => (
              <Link 
                key={item.key} 
                to={item.path} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: getCurrentKey() === item.key ? 'var(--color-primary-light)' : 'transparent',
                  color: getCurrentKey() === item.key ? 'var(--color-primary)' : 'inherit',
                  fontWeight: getCurrentKey() === item.key ? '600' : 'normal',
                  transition: 'all var(--transition-fast)',
                }}
                onClick={() => setDrawerVisible(false)}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </Space>
        )}
      </Drawer>
      

    </Header>
  );
};

export default Navbar;
