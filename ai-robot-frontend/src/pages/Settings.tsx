import React, { useState } from 'react';
import { 
  Card, 
  Switch, 
  Radio, 
  Typography, 
  Space, 
  Row, 
  Col,
  Slider,
  Button,
  Result
} from 'antd';
import {
  MoonOutlined, 
  SunOutlined, 
  LayoutOutlined,
  BellOutlined,
  MessageOutlined,
  ReloadOutlined,
  RestOutlined,
  SaveOutlined,
  SmileOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const Settings: React.FC = () => {
  // 主题设置
  const [darkMode, setDarkMode] = useState<boolean>(localStorage.getItem('darkMode') === 'true');
  
  // 布局设置
  const [layout, setLayout] = useState<string>(localStorage.getItem('layout') || 'vertical');
  
  // 通知设置
  const [notifications, setNotifications] = useState<boolean>(localStorage.getItem('notifications') === 'true' || true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(localStorage.getItem('soundEnabled') === 'true' || true);
  
  // 刷新频率设置
  const [refreshInterval, setRefreshInterval] = useState<number>(parseInt(localStorage.getItem('refreshInterval') || '30'));
  
  // 保存设置到本地存储
  const saveSettings = (key: string, value: string | boolean | number) => {
    localStorage.setItem(key, String(value));
    // 触发设置更新事件
    window.dispatchEvent(new Event('settingsUpdated'));
  };
  
  // 切换主题
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    saveSettings('darkMode', newMode);
    
    // 应用主题到文档
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // 切换布局
  const handleLayoutChange = (e: any) => {
    const newLayout = e.target.value;
    setLayout(newLayout);
    saveSettings('layout', newLayout);
  };
  
  // 切换通知
  const toggleNotifications = () => {
    const newState = !notifications;
    setNotifications(newState);
    saveSettings('notifications', newState);
  };
  
  // 切换声音
  const toggleSoundEnabled = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    saveSettings('soundEnabled', newState);
  };
  
  return (
    <div style={{ 
      padding: '24px',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ marginBottom: '8px', color: 'var(--color-text-primary)' }}>
          个性化设置
        </Title>
        <Text type="secondary">
          自定义您的应用体验，让AI陪伴机器人更符合您的使用习惯
        </Text>
      </div>
      
      <Row gutter={[24, 24]}>
        {/* 主题设置 */}
        <Col xs={24} xl={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MoonOutlined /> <Text strong>主题设置</Text>
              </div>
            }
            style={{ 
              border: 'none',
              boxShadow: 'var(--shadow-sm)',
              backgroundColor: 'var(--color-bg)',
              borderRadius: 'var(--radius-md)',
              transition: 'all var(--transition-normal)'
            }}
            bodyStyle={{ padding: '24px' }}
            hoverable
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space align="center">
                    {darkMode ? <MoonOutlined /> : <SunOutlined />}
                    <Text strong>深色主题</Text>
                  </Space>
                  <Switch 
                    checked={darkMode} 
                    checkedChildren={<MoonOutlined />} 
                    unCheckedChildren={<SunOutlined />} 
                    onChange={toggleDarkMode} 
                  />
                </div>
                <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                  切换应用的主题风格，深色主题更适合夜间使用
                </Paragraph>
              </Space>
            </Space>
          </Card>
        </Col>
        
        {/* 布局设置 */}
        <Col xs={24} xl={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LayoutOutlined /> <Text strong>布局设置</Text>
              </div>
            }
            style={{ 
              border: 'none',
              boxShadow: 'var(--shadow-sm)',
              backgroundColor: 'var(--color-bg)',
              borderRadius: 'var(--radius-md)',
              transition: 'all var(--transition-normal)'
            }}
            bodyStyle={{ padding: '24px' }}
            hoverable
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Text strong>界面布局</Text>
                <Radio.Group 
                  value={layout} 
                  onChange={handleLayoutChange}
                  buttonStyle="solid"
                  size="large"
                >
                  <Radio.Button value="vertical">
                    <Space>
                      <LayoutOutlined /> 垂直布局
                    </Space>
                  </Radio.Button>
                  <Radio.Button value="horizontal">
                    <Space>
                      <LayoutOutlined /> 水平布局
                    </Space>
                  </Radio.Button>
                  <Radio.Button value="mix">
                    <Space>
                      <LayoutOutlined /> 混合布局
                    </Space>
                  </Radio.Button>
                </Radio.Group>
                <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                  选择适合您的界面布局方式，提高工作效率
                </Paragraph>
              </Space>
            </Space>
          </Card>
        </Col>
        
        {/* 通知设置 */}
        <Col xs={24} xl={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BellOutlined /> <Text strong>通知设置</Text>
              </div>
            }
            style={{ 
              border: 'none',
              boxShadow: 'var(--shadow-sm)',
              backgroundColor: 'var(--color-bg)',
              borderRadius: 'var(--radius-md)',
              transition: 'all var(--transition-normal)'
            }}
            bodyStyle={{ padding: '24px' }}
            hoverable
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* 通知开关 */}
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space align="center">
                    <BellOutlined />
                    <Text strong>启用通知</Text>
                  </Space>
                  <Switch 
                    checked={notifications} 
                    onChange={toggleNotifications} 
                  />
                </div>
                <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                  接收设备状态变化和系统通知
                </Paragraph>
              </Space>
              
              {/* 声音开关 */}
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space align="center">
                    <MessageOutlined />
                    <Text strong>通知声音</Text>
                  </Space>
                  <Switch 
                    checked={soundEnabled} 
                    onChange={toggleSoundEnabled} 
                    disabled={!notifications}
                  />
                </div>
                <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                  收到通知时播放提示音
                </Paragraph>
              </Space>
            </Space>
          </Card>
        </Col>
        
        {/* 刷新设置 */}
        <Col xs={24} xl={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ReloadOutlined /> <Text strong>刷新设置</Text>
              </div>
            }
            style={{ 
              border: 'none',
              boxShadow: 'var(--shadow-sm)',
              backgroundColor: 'var(--color-bg)',
              borderRadius: 'var(--radius-md)',
              transition: 'all var(--transition-normal)'
            }}
            bodyStyle={{ padding: '24px' }}
            hoverable
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>数据刷新频率</Text>
                  <Text strong style={{ color: 'var(--color-primary)' }}>{refreshInterval}秒</Text>
                </div>
                <Slider 
                  min={10}
                  max={60}
                  step={5}
                  value={refreshInterval}
                  onChange={setRefreshInterval}
                  onAfterChange={(value) => saveSettings('refreshInterval', value)}
                  tooltip={{ formatter: (value) => `${value}秒` }}
                  marks={{
                    10: '10秒',
                    30: '30秒',
                    60: '60秒'
                  }}
                />
                <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                  设置数据自动刷新的时间间隔，缩短间隔可获得更实时的数据
                </Paragraph>
              </Space>
            </Space>
          </Card>
        </Col>
        
        {/* 保存设置 */}
        <Col xs={24}>
          <Card 
            style={{ 
              border: 'none',
              boxShadow: 'var(--shadow-sm)',
              backgroundColor: 'var(--color-bg-light)',
              borderRadius: 'var(--radius-md)',
              transition: 'all var(--transition-normal)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Result
              status="success"
              icon={<SmileOutlined />}
              title="设置已保存"
              subTitle="您的个性化设置已保存到本地，下次登录时将自动应用"
              extra={
                <Space size="large">
                  <Button type="primary" size="large" icon={<SaveOutlined />}>
                    重新保存设置
                  </Button>
                  <Button size="large" icon={<RestOutlined />}>
                    恢复默认设置
                  </Button>
                </Space>
              }
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Settings;