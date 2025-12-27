import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, RobotOutlined } from '@ant-design/icons';
import { authApi } from '../services/api';
import type { RegisterRequest } from '../types';

const Register: React.FC = () => {
  const [form] = Form.useForm<RegisterRequest>();
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterRequest) => {
    setLoading(true);

    try {
      console.log('提交注册请求:', values);
      const response = await authApi.register(values);
      console.log('注册成功:', response);
      message.success('注册成功，正在跳转...');
      navigate('/');
    } catch (err: any) {
      console.error('注册失败:', err);
      console.error('错误详情:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      // 处理验证错误
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors.map((error: any) => {
          if (error.field === 'email') {
            return '请输入有效的邮箱地址';
          }
          return error.message;
        }).join('\n');
        message.error(validationErrors || '注册失败，请稍后重试');
      } else {
        message.error(err.response?.data?.message || '注册失败，请稍后重试');
      }
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
        
        <h2 style={{ 
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '32px',
          textAlign: 'center',
          color: 'var(--color-text-primary)'
        }}>创建账号</h2>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            username: '',
            email: '',
            password: ''
          }}
          autoComplete="on"
        >
          <Form.Item
            name="username"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>用户名</span>}
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, message: '用户名长度不能少于2个字符' },
              { max: 20, message: '用户名长度不能超过20个字符' }
            ]}
            style={{ marginBottom: '16px' }}
          >
            <Input 
              prefix={<UserOutlined style={{ color: 'var(--color-text-tertiary)' }} />} 
              placeholder="请输入用户名"
              size="large"
              style={{ 
                height: '48px',
                fontSize: '14px',
                borderRadius: 'var(--radius-md)'
              }}
            />
          </Form.Item>
          
          <Form.Item
            name="email"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>邮箱</span>}
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
                borderRadius: 'var(--radius-md)'
              }}
              autoComplete="email"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            label={<span style={{ fontWeight: '600', fontSize: '14px' }}>密码</span>}
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度不能少于6个字符' },
              { max: 20, message: '密码长度不能超过20个字符' }
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
                borderRadius: 'var(--radius-md)'
              }}
              autoComplete="new-password"
              visibilityToggle
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
              注册
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ 
          textAlign: 'center', 
          fontSize: '14px',
          color: 'var(--color-text-secondary)'
        }}>
          已有账号？ <Link to="/login" style={{ 
            color: 'var(--color-primary)',
            fontWeight: '600',
            marginLeft: '4px',
            transition: 'all var(--transition-fast)'
          }}>
            立即登录
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
