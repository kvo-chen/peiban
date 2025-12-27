import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { authApi } from '../services/api';

// 模拟API调用
jest.mock('../services/api', () => ({
  authApi: {
    login: jest.fn(),
    phoneLogin: jest.fn(),
    sendCode: jest.fn(),
    register: jest.fn(),
    getCurrentUser: jest.fn()
  }
}));

describe('Login Component', () => {
  // 渲染组件的辅助函数
  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  test('renders login page correctly', () => {
    renderLogin();
    
    // 检查页面标题
    expect(screen.getByText('AI陪伴机器人')).toBeInTheDocument();
    
    // 检查邮箱登录选项
    expect(screen.getByText('邮箱登录')).toBeInTheDocument();
    
    // 检查手机号登录选项
    expect(screen.getByText('手机号登录')).toBeInTheDocument();
  });

  test('validates email and password fields', async () => {
    renderLogin();
    
    // 点击登录按钮，不填写任何信息
    const loginButton = screen.getByText('登录');
    fireEvent.click(loginButton);
    
    // 检查是否显示验证错误
    await waitFor(() => {
      expect(screen.getByText('请输入邮箱')).toBeInTheDocument();
      expect(screen.getByText('请输入密码')).toBeInTheDocument();
    });
    
    // 填写无效邮箱
    const emailInput = screen.getByPlaceholderText('请输入邮箱');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(loginButton);
    
    // 检查是否显示邮箱格式错误
    await waitFor(() => {
      expect(screen.getByText('请输入有效的邮箱地址')).toBeInTheDocument();
    });
  });

  test('validates phone and code fields', async () => {
    renderLogin();
    
    // 切换到手机号登录
    const phoneTab = screen.getByText('手机号登录');
    fireEvent.click(phoneTab);
    
    // 点击登录按钮，不填写任何信息
    const loginButton = screen.getByText('登录');
    fireEvent.click(loginButton);
    
    // 检查是否显示验证错误
    await waitFor(() => {
      expect(screen.getByText('请输入手机号')).toBeInTheDocument();
      expect(screen.getByText('请输入验证码')).toBeInTheDocument();
    });
    
    // 填写无效手机号
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.click(loginButton);
    
    // 检查是否显示手机号格式错误
    await waitFor(() => {
      expect(screen.getByText('请输入有效的手机号')).toBeInTheDocument();
    });
    
    // 填写有效的手机号和无效的验证码
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    fireEvent.change(codeInput, { target: { value: '123' } });
    fireEvent.click(loginButton);
    
    // 检查是否显示验证码格式错误
    await waitFor(() => {
      expect(screen.getByText('验证码长度为6位')).toBeInTheDocument();
    });
  });

  test('calls login API with correct credentials', async () => {
    // 设置模拟返回值
    (authApi.login as jest.Mock).mockResolvedValue({
      data: {
        token: 'mock-token',
        user: { id: 1, username: 'testuser', email: 'test@example.com' }
      }
    });
    
    renderLogin();
    
    // 填写有效的邮箱和密码
    const emailInput = screen.getByPlaceholderText('请输入邮箱');
    const passwordInput = screen.getByPlaceholderText('请输入密码');
    const loginButton = screen.getByText('登录');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    // 检查是否调用了login API
    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  test('calls phoneLogin API with correct credentials', async () => {
    // 设置模拟返回值
    (authApi.phoneLogin as jest.Mock).mockResolvedValue({
      data: {
        token: 'mock-token',
        user: { id: 1, username: 'testuser', phone: '13800138000' }
      }
    });
    
    renderLogin();
    
    // 切换到手机号登录
    const phoneTab = screen.getByText('手机号登录');
    fireEvent.click(phoneTab);
    
    // 填写有效的手机号和验证码
    const phoneInput = screen.getByPlaceholderText('请输入手机号');
    const codeInput = screen.getByPlaceholderText('请输入验证码');
    const loginButton = screen.getByText('登录');
    
    fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(loginButton);
    
    // 检查是否调用了phoneLogin API
    await waitFor(() => {
      expect(authApi.phoneLogin).toHaveBeenCalledWith({
        phone: '13800138000',
        code: '123456'
      });
    });
  });
});
