import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import DeviceManagement from './pages/DeviceManagement';
import DeviceDetail from './pages/DeviceDetail';
import './App.css';

// 受保护的路由组件，用于确保只有登录用户才能访问
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
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
            
            {/* 默认路由，重定向到登录页 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
