import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Spin, ConfigProvider } from 'antd';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
// 使用React.lazy实现组件懒加载
const DeviceManagement = lazy(() => import('./pages/DeviceManagement'));
const DeviceDetail = lazy(() => import('./pages/DeviceDetail'));
const DataAnalysis = lazy(() => import('./pages/DataAnalysis'));
const Settings = lazy(() => import('./pages/Settings'));
const Logs = lazy(() => import('./pages/Logs'));
import './App.css';

const { Content } = Layout;

// 加载中组件
const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
    <Spin size="large" />
  </div>
);

// 受保护的路由组件，用于确保只有登录用户才能访问
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  
  // 为了方便测试，允许使用mock_token登录
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  // 从本地存储加载主题设置
  const [darkMode, setDarkMode] = React.useState<boolean>(localStorage.getItem('darkMode') === 'true');
  
  // 应用主题设置
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // 监听设置更新事件
  useEffect(() => {
    const handleSettingsUpdate = () => {
      setDarkMode(localStorage.getItem('darkMode') === 'true');
    };
    
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);
  
  return (
    <ConfigProvider
      theme={{
        token: {
          // 主色调
          colorPrimary: '#6366f1',
          colorPrimaryHover: '#818cf8',
          colorPrimaryActive: '#4f46e5',
          colorPrimaryBorder: '#c7d2fe',
          colorPrimaryBg: '#f5f7ff',
          
          // 辅助色
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          colorInfo: '#3b82f6',
          
          // 中性色
          colorTextPrimary: '#1f2937',
          colorTextSecondary: '#6b7280',
          colorTextTertiary: '#9ca3af',
          colorBorder: '#e5e7eb',
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f9fafb',
          
          // 字体
          fontSize: 14,
          fontSizeLG: 16,
          fontSizeXL: 20,
          
          // 圆角
          borderRadius: 8,
          borderRadiusLG: 12,
          
          // 阴影
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          boxShadowSecondary: '0 6px 20px rgba(0, 0, 0, 0.08)',
          
          // 间距
          marginXS: 4,
          marginSM: 8,
          margin: 16,
          marginLG: 24,
          marginXL: 32,
          
          // 导航栏
          headerBg: '#6366f1',
          
          // 暗黑模式适配
          ...(darkMode && {
            colorPrimary: '#818cf8',
            colorTextPrimary: '#f9fafb',
            colorTextSecondary: '#d1d5db',
            colorTextTertiary: '#9ca3af',
            colorBorder: '#374151',
            colorBgContainer: '#1f2937',
            colorBgLayout: '#111827',
            headerBg: '#4f46e5',
          }),
        },
      }}
    >
      <Router>
        <Layout className="App">
          <Navbar />
          <Content className="main-content">
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* 公共路由 */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* 受保护路由 */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <DeviceManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/device/:id" 
                  element={
                    <ProtectedRoute>
                      <DeviceDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/analysis" 
                  element={
                    <ProtectedRoute>
                      <DataAnalysis />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/logs" 
                  element={
                    <ProtectedRoute>
                      <Logs />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />
                
                {/* 默认路由，重定向到登录页 */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Suspense>
          </Content>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
