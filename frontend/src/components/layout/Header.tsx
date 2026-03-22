import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, removeAuthToken } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const authenticated = isAuthenticated();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();

    // Remove auth token and redirect to login
    removeAuthToken();
    navigate('/login');
  };

  return (
    <header>
      <div className="header-content">
        <div className="logo">
          <Link to="/">AppName</Link>
        </div>

        <nav className="nav-links">
          {authenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <a href="#" className="nav-link" onClick={handleLogout}>Logout</a>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link">Sign Up</Link>
            </>
          )}
          <button
            onClick={toggleTheme}
            className="btn btn-sm"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '' : ''}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
