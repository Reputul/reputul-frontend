// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import CustomerManagementPage from "./pages/CustomerManagementPage";
import ContactsPage from "./pages/ContactsPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PrivateRoute from "./components/PrivateRoute";
import BusinessPublicPage from "./pages/BusinessPublicPage";
import EmailTemplatesPage from "./pages/EmailTemplatesPage";
import {
  NotFoundPage,
  ServerErrorPage,
  ForbiddenPage,
  MaintenancePage,
} from "./pages/ErrorPage";
import ErrorBoundary from "./components/ErrorBoundary";
import ReviewRequestPage from "./pages/ReviewRequestPage";
import ReviewPlatformSetupPage from "./pages/ReviewPlatformSetupPage";
import CustomerFeedbackPage from "./pages/CustomerFeedbackPage";
import FeedbackGatePage from "./pages/FeedbackGatePage";
import OptInPolicy from "./pages/OptInPolicy";
import PricingPage from "./pages/PricingPage";
import AccountBillingPage from "./pages/AccountBillingPage";
import CheckoutPages from "./pages/CheckoutPages";

function App() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceChecked, setMaintenanceChecked] = useState(false);

  // Check maintenance status on app load
  useEffect(() => {
    const checkMaintenanceStatus = async () => {
      try {
        // You can implement a real API call here to check maintenance status
        // For now, this is a placeholder that checks localStorage or env variable
        const maintenanceStatus =
          import.meta.env.VITE_MAINTENANCE_MODE === "true" ||
          localStorage.getItem("maintenanceMode") === "true";

        setIsMaintenanceMode(maintenanceStatus);
      } catch (error) {
        // Silently handle maintenance check errors in production
        // If we can't check status, assume app is available
        setIsMaintenanceMode(false);
      } finally {
        setMaintenanceChecked(true);
      }
    };

    checkMaintenanceStatus();
  }, []);

  // Determine whether to show the Navbar (hide on auth pages AND customer-facing pages)
  const hideNavbarOnRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  // Also hide navbar on customer-facing feedback pages
  const currentPath = window.location.pathname;
  const isCustomerFeedbackRoute =
    currentPath.startsWith("/feedback/") ||
    currentPath.startsWith("/feedback-gate/");

  const shouldShowNavbar =
    !hideNavbarOnRoutes.includes(currentPath) && !isCustomerFeedbackRoute;

  // Show loading while checking maintenance status
  if (!maintenanceChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary-200"></div>
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-primary-500 border-r-primary-400 absolute top-0"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Loading Reputul
          </h2>
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
              {shouldShowNavbar && <Navbar />}
              <Toast />
              <Routes>
                {/* Redirect root path to dashboard if authenticated, else login */}
                <Route path="/" element={<LandingPage />} />

                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/business/:id" element={<BusinessPublicPage />} />

                {/* NEW: Billing routes */}
                <Route path="/pricing" element={<PricingPage />} />
                <Route
                  path="/checkout/success"
                  element={<CheckoutPages.Success />}
                />
                <Route
                  path="/checkout/error"
                  element={<CheckoutPages.Error />}
                />

                {/* NEW: Protected billing routes */}
                <Route
                  path="/account/billing"
                  element={
                    <PrivateRoute>
                      <AccountBillingPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/account"
                  element={<Navigate to="/account/billing" replace />}
                />

                {/* Feedback Gate Route - Google Compliant Rating Interface */}
                <Route
                  path="/feedback-gate/:customerId"
                  element={<FeedbackGatePage />}
                />

                {/* Private Feedback Route - Now works with feedback gate flow */}
                <Route
                  path="/feedback/:customerId"
                  element={<CustomerFeedbackPage />}
                />

                <Route path="/opt-in-policy" element={<OptInPolicy />} />

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
                  path="/contacts"
                  element={
                    <PrivateRoute>
                      <ContactsPage />
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
                  path="/review-requests"
                  element={
                    <PrivateRoute>
                      <ReviewRequestPage />
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
                <Route
                  path="/review-platform-setup"
                  element={
                    <PrivateRoute>
                      <ReviewPlatformSetupPage />
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
