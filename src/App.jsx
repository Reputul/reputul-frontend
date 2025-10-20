import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BusinessProvider } from "./context/BusinessContext"; // NEW: Import BusinessProvider
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";
import DashboardLayout from "./components/DashboardLayout";
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
import CampaignManagementPage from "./pages/CampaignManagementPage";
import {
  NotFoundPage,
  ServerErrorPage,
  ForbiddenPage,
  MaintenancePage,
} from "./pages/ErrorPage";
import ErrorBoundary from "./components/ErrorBoundary";
import ReviewRequestPage from "./pages/ReviewRequestPage";
import ReviewPlatformsPage from "./pages/ReviewPlatformsPage";
import CustomerFeedbackPage from "./pages/CustomerFeedbackPage";
import FeedbackGatePage from "./pages/FeedbackGatePage";
import OptInPolicy from "./pages/OptInPolicy";
import PricingPage from "./pages/PricingPage";
import AccountBillingPage from "./pages/AccountBillingPage";
import CheckoutPages from "./pages/CheckoutPages";
import SmsSignupPage from "./pages/SmsSignupPage";
import TwilioProofPage from "./pages/TwilioProofPage";
import AutomationPage from "./pages/AutomationPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import InsightsPage from "./pages/InsightsPage";

// AppContent component - must be inside Router to use useLocation
function AppContent() {
  const location = useLocation();

  // Don't show navbar for authenticated routes
  const noNavbarRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/dashboard",
    "/customers",
    "/contacts",
    "/email-templates",
    "/review-requests",
    "/review-platform-setup",
    "/profile",
    "/automation",
    "/campaigns",
    "/account",
    "/insights",
  ];

  const shouldShowNavbar = !noNavbarRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <div className="App">
      {shouldShowNavbar && <Navbar />}
      <Toaster
        position="top-right"
        expand={true}
        richColors
        closeButton
        duration={4000}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/business/:id" element={<BusinessPublicPage />} />
        <Route path="/sms-signup" element={<SmsSignupPage />} />
        <Route path="/sms-signup/:businessId" element={<SmsSignupPage />} />
        <Route path="/twilio-proof" element={<TwilioProofPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/checkout/success" element={<CheckoutPages.Success />} />
        <Route path="/checkout/error" element={<CheckoutPages.Error />} />
        <Route path="/oauth/callback/google" element={<OAuthCallbackPage />} />
        <Route
          path="/oauth/callback/facebook"
          element={<OAuthCallbackPage />}
        />
        <Route
          path="/feedback-gate/:customerId"
          element={<FeedbackGatePage />}
        />
        <Route
          path="/feedback/:customerId"
          element={<CustomerFeedbackPage />}
        />
        <Route path="/opt-in-policy" element={<OptInPolicy />} />

        {/* Error routes */}
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/server-error" element={<ServerErrorPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />

        {/* Protected routes WITH SIDEBAR LAYOUT */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <CustomerManagementPage />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <ContactsPage />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <InsightsPage />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/email-templates"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <EmailTemplatesPage />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/review-requests"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <ReviewRequestPage />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/review-platforms"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <ReviewPlatformsPage />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/automation"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <AutomationPage />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/campaigns"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <CampaignManagementPage />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/account/billing"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <AccountBillingPage />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/account"
          element={<Navigate to="/account/billing" replace />}
        />

        {/* 404 - Keep this LAST */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

function App() {
  useEffect(() => {
    document.body.style.overflow = "";
  }, []);

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isCheckingMaintenance, setIsCheckingMaintenance] = useState(true);

  // Check for maintenance mode on app load
  useEffect(() => {
    const checkMaintenanceMode = () => {
      const envMaintenanceMode =
        import.meta.env.VITE_MAINTENANCE_MODE === "true";
      const localMaintenanceMode =
        localStorage.getItem("maintenanceMode") === "true";
      setIsMaintenanceMode(envMaintenanceMode || localMaintenanceMode);
      setIsCheckingMaintenance(false);
    };

    checkMaintenanceMode();
  }, []);

  if (isCheckingMaintenance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-primary-500 border-r-primary-400 absolute top-0"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Loading Reputul
          </h2>
          <p className="text-blue-200">Please wait...</p>
        </div>
      </div>
    );
  }

  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <Router>
      <AuthProvider>
        {/* NEW: Wrap with BusinessProvider inside AuthProvider */}
        <BusinessProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </BusinessProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
