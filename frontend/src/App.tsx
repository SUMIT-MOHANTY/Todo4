import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from './context/ThemeContext';

// Import components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import ClientDetail from './components/ClientDetail';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetail';
import InvoiceList from './components/InvoiceList';
import InvoiceDetail from './components/InvoiceDetail';
import Login from './components/Login';
import Register from './components/Register';
import NotFound from './components/NotFound';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import Footer from './components/layout/Footer';

// Import styles
import './styles.css';

// Define auth context
export const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  user: any;
  login: (token: string, user: any) => void;
  logout: () => void;
}>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [appInitialized, setAppInitialized] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is authenticated on app load
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      // Set axios default headers for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }

    setTimeout(() => {
      setIsLoading(false);
      setAppInitialized(true);
    }, 300);

    // Security: Add event listener for storage changes to detect token changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && e.newValue === null) {
        // Token was removed in another tab/window, log out this instance too
        logout();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
          <Router>
            <div className="app">
              {isAuthenticated ? (
                <>
                  <Header toggleSidebar={toggleSidebar} user={user} logout={logout} />
                  <div className="main-container">
                    <Sidebar isOpen={sidebarOpen} />
                    <main className={`content ${sidebarOpen ? '' : 'expanded'}`}>
                      {appInitialized && (
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/clients" element={<ClientList />} />
                          <Route path="/clients/:id" element={<ClientDetail />} />
                          <Route path="/projects" element={<ProjectList />} />
                          <Route path="/projects/:id" element={<ProjectDetail />} />
                          <Route path="/tasks" element={<TaskList />} />
                          <Route path="/tasks/:id" element={<TaskDetail />} />
                          <Route path="/invoices" element={<InvoiceList />} />
                          <Route path="/invoices/:id" element={<InvoiceDetail />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      )}
                    </main>
                  </div>
                  <Footer />
                </>
              ) : (
                <div className="auth-container">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </Routes>
                </div>
              )}
            </div>
          </Router>
        </AuthContext.Provider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
