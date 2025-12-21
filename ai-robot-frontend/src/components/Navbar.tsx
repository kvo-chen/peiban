import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const Navbar: React.FC = () => {
  const user = localStorage.getItem('user');
  const navigate = useNavigate();

  const handleLogout = () => {
    authApi.logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">AI陪伴机器人</Link>
        </div>
        <div className="navbar-menu">
          {user ? (
            <>
              <Link to="/" className="navbar-link">设备管理</Link>
              <button onClick={handleLogout} className="navbar-button">退出登录</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">登录</Link>
              <Link to="/register" className="navbar-link">注册</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
