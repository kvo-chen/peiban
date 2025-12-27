import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Tabs, message, Card } from 'antd';
import { LockOutlined, PhoneOutlined, MailOutlined, RobotOutlined } from '@ant-design/icons';
import { authApi } from '../services/api';
import type { LoginRequest, PhoneLoginRequest, SendCodeRequest } from '../types';

const { TabPane } = Tabs;

const Login: React.FC = () => {
  // 表单实例
  const [emailForm] = Form.useForm<LoginRequest>();
  const [phoneForm] = Form.useForm<PhoneLoginRequest>();
  
  // 验证码倒计时
  const [countdown, setCountdown] = useState<number>(0);
  
  // 加载状态
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // 发送验证码
  const handleSendCode = async () => {
    const phone = phoneForm.getFieldValue('phone');
    if (!phone) {
      message.error('请输入手机号');
      return;
    }
    
    if (countdown > 0) {
      return;
    }
    
    try {
      setLoading(true);
      
      const sendCodeRequest: SendCodeRequest = {
        phone
      };
      
      await authApi.sendCode(sendCodeRequest);
      message.success('验证码发送成功');
      
      // 开始倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      message.error(err.response?.data?.message || '发送验证码失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理邮箱登录
  const handleEmailSubmit = async (values: LoginRequest) => {
    try {
      setLoading(true);
      await authApi.login(values);
      message.success('登录成功');
      navigate('/');
    } catch (err: any) {
      message.error(err.response?.data?.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理手机号登录
  const handlePhoneSubmit = async (values: PhoneLoginRequest) => {
    try {
      setLoading(true);
      await authApi.phoneLogin(values);
      message.success('登录成功');
      navigate('/');
    } catch (err: any) {
      message.error(err.response?.data?.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - 64px)', 
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: '440px',
          borderRadius: 'var(--radius-lg)',
          padding: '0',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          border: 'none',
          overflow: 'hidden',
          animation: 'slideIn 0.5s ease-out 0.1s both'
        }}
        bodyStyle={{ padding: '40px 32px' }}
      >
        {/* 品牌标识 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px'
        }}>
          <RobotOutlined style={{ 
            fontSize: '40px',
            color: 'var(--color-primary)',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }} />
          <h1 style={{ 
            fontSize: '28px',
            fontWeight: '700',
            margin: 0,
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>AI陪伴机器人</h1>
        </div>
        
        <Tabs 
          defaultActiveKey="email" 
          centered
          style={{ marginBottom: '24px' }}
          tabBarStyle={{ marginBottom: '24px' }}
        >
          {/* 邮箱登录 */}
          <TabPane 
            tab={<><MailOutlined style={{ marginRight: '8px' }} />邮箱登录</>} 
            key="email"
          >
            <Form
              form={emailForm}
              layout="vertical"
              onFinish={handleEmailSubmit}
              initialValues={{
                email: 'test@example.com',
                password: 'password123'
              }}
              autoComplete="on"
            >
              <Form.Item
                name="email"
                label={<span style={{ 
                  fontWeight: '600', 
                  fontSize: '14px',
                  color: 'var(--color-text-primary)',
                  transition: 'all var(--transition-fast)'
                }}>邮箱</span>}
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
                style={{ marginBottom: '16px' }}
              >
                <Input 
                  prefix={<MailOutlined style={{ color: 'var(--color-text-tertiary)' }} />} 
                  placeholder="请输入邮箱"
                  size="large"
                  style={{ 
                    height: '48px',
                    fontSize: '14px',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all var(--transition-fast)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                />
              </Form.Item>
              
              <Form.Item
                name="password"
                label={<span style={{ 
                  fontWeight: '600', 
                  fontSize: '14px',
                  color: 'var(--color-text-primary)',
                  transition: 'all var(--transition-fast)'
                }}>密码</span>}
                rules={[
                  { required: true, message: '请输入密码' }
                ]}
                style={{ marginBottom: '24px' }}
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: 'var(--color-text-tertiary)' }} />} 
                  placeholder="请输入密码"
                  size="large"
                  style={{ 
                    height: '48px',
                    fontSize: '14px',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all var(--transition-fast)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'none'
                  }}
                  onFocus={(e) => {
                    const input = e.currentTarget.querySelector('input');
                    if (input) {
                      input.style.borderColor = 'var(--color-primary)';
                      input.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.1)';
                      input.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onBlur={(e) => {
                    const input = e.currentTarget.querySelector('input');
                    if (input) {
                      input.style.borderColor = 'var(--color-border)';
                      input.style.boxShadow = 'none';
                      input.style.transform = 'translateY(0)';
                    }
                  }}
                  autoComplete="current-password"
                />
              </Form.Item>
              
              <Form.Item style={{ marginBottom: '16px' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading} 
                  block
                  size="large"
                  style={{ 
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: '600',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          {/* 手机号登录 */}
          <TabPane 
            tab={<><PhoneOutlined style={{ marginRight: '8px' }} />手机号登录</>} 
            key="phone"
          >
            <Form
              form={phoneForm}
              layout="vertical"
              onFinish={handlePhoneSubmit}
              initialValues={{
                phone: '',
                code: ''
              }}
              autoComplete="on"
            >
              <Form.Item
                name="phone"
                label={<span style={{ 
                  fontWeight: '600', 
                  fontSize: '14px',
                  color: 'var(--color-text-primary)',
                  transition: 'all var(--transition-fast)'
                }}>手机号</span>}
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
                ]}
                style={{ marginBottom: '16px' }}
              >
                <Input 
                  prefix={<PhoneOutlined style={{ color: 'var(--color-text-tertiary)' }} />} 
                  placeholder="请输入手机号"
                  size="large"
                  style={{ 
                    height: '48px',
                    fontSize: '14px',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all var(--transition-fast)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  maxLength={11}
                />
              </Form.Item>
              
              <Form.Item
                name="code"
                label={<span style={{ 
                  fontWeight: '600', 
                  fontSize: '14px',
                  color: 'var(--color-text-primary)',
                  transition: 'all var(--transition-fast)'
                }}>验证码</span>}
                rules={[
                  { required: true, message: '请输入验证码' },
                  { len: 6, message: '验证码长度为6位' }
                ]}
                style={{ marginBottom: '24px' }}
              >
                <Input.Group compact style={{ width: '100%' }}>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.phone !== currentValues.phone}
                  >
                    {() => (
                      <Input 
                        prefix={<LockOutlined style={{ color: 'var(--color-text-tertiary)' }} />} 
                        placeholder="请输入验证码"
                        size="large"
                        style={{ 
                          width: '60%',
                          height: '48px',
                          fontSize: '14px',
                          borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
                          transition: 'all var(--transition-fast)',
                          border: '1px solid var(--color-border)',
                          boxShadow: 'none'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-primary)';
                          e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.1)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        maxLength={6}
                      />
                    )}
                  </Form.Item>
                  <Button 
                    type="link" 
                    onClick={handleSendCode}
                    disabled={loading || countdown > 0}
                    size="large"
                    style={{ 
                      width: '40%',
                      height: '48px',
                      fontSize: '14px',
                      fontWeight: '500',
                      borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                      color: 'var(--color-primary)',
                      padding: '0 16px',
                      transition: 'all var(--transition-fast)',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {countdown > 0 ? `${countdown}s后重发` : '发送验证码'}
                  </Button>
                </Input.Group>
              </Form.Item>
              
              <Form.Item style={{ marginBottom: '16px' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading} 
                  block
                  size="large"
                  style={{ 
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: '600',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
        
        <div style={{ 
          textAlign: 'center', 
          fontSize: '14px',
          color: 'var(--color-text-secondary)'
        }}>
          还没有账号？ <Link to="/register" style={{ 
            color: 'var(--color-primary)',
            fontWeight: '600',
            marginLeft: '4px',
            transition: 'all var(--transition-fast)'
          }}>
            立即注册
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;