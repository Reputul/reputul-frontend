// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import DashboardPage from './pages/DashboardPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import BusinessPublicPage from './pages/BusinessPublicPage';
import EmailTemplatesPage from './pages/EmailTemplatesPage';
import { NotFoundPage, ServerErrorPage, ForbiddenPage, MaintenancePage } from './pages/ErrorPage';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceChecked, setMaintenanceChecked] = useState(false);

  // Check maintenance status on app load
  useEffect(() => {
    const checkMaintenanceStatus = async () => {
      try {
        // You can implement a real API call here to check maintenance status
        // For now, this is a placeholder that checks localStorage or env variable
        const maintenanceStatus = process.env.REACT_APP_MAINTENANCE_MODE === 'true' || 
                                 localStorage.getItem('maintenanceMode') === 'true';
        
        setIsMaintenanceMode(maintenanceStatus);
      } catch (error) {
        console.error('Error checking maintenance status:', error);
        // If we can't check status, assume app is available
        setIsMaintenanceMode(false);
      } finally {
        setMaintenanceChecked(true);
      }
    };

    checkMaintenanceStatus();
  }, []);

  // Show loading while checking maintenance status
  if (!maintenanceChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Reputul</h2>
          <p className="text-blue-200">Please wait...</p>
        </div>
      </div>
    );
  }

  // Show maintenance page if in maintenance mode
  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <ErrorBoundary>
            <div className="App">
              <Navbar />
              <Toast />
              <Routes>
                {/* Redirect root path to dashboard if authenticated, else login */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/business/:id" element={<BusinessPublicPage />} />
                
                {/* Error routes */}
                <Route path="/forbidden" element={<ForbiddenPage />} />
                <Route path="/server-error" element={<ServerErrorPage />} />
                <Route path="/maintenance" element={<MaintenancePage />} />

                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <PrivateRoute>
                      <CustomerManagementPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/email-templates"
                  element={
                    <PrivateRoute>
                      <EmailTemplatesPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  }
                />

                {/* 404 - Keep this LAST to catch all unmatched routes */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;