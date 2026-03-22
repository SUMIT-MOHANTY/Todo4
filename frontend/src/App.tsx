import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import Dashboard from './components/dashboard/Dashboard';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import NotFound from './components/common/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './styles.css';

// Auth service for handling token management
import { isAuthenticated, getAuthToken } from './services/authService';

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [appInitialized, setAppInitialized] = useState<boolean>(false);

  // Simulate app initialization and authentication check
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check token validity and refresh if needed
        const validToken = await isAuthenticated();

        // Add a slight delay to prevent flickering
        setTimeout(() => {
          setLoading(false);
          setAppInitialized(true);
        }, 300);
      } catch (error) {
        console.error("App initialization error:", error);
        setLoading(false);
        setAppInitialized(true);
      }
    };

    initializeApp();

    // Security: Add event listener for storage changes to detect token changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' && e.newValue === null) {
        // Token was removed in another tab/window, log out this instance too
        window.location.href = '/login';
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Router>
          <div className="app-container">
            <Header />
            <main className="main-content">
              {appInitialized ? (
                <Routes>
                  <Route path="/login" element={
                    isAuthenticated() ? <Navigate to="/dashboard" /> : <LoginForm />
                  } />
                  <Route path="/signup" element={
                    isAuthenticated() ? <Navigate to="/dashboard" /> : <SignupForm />
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              ) : null}
            </main>
            <Footer />
          </div>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
