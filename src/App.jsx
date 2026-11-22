import { useEffect } from 'react';
import { useCurrentPath, navigate } from './router';
import { ROUTE_CONFIG, ROUTES, ROLES } from './router/routes';
import { AuthProvider, useAuth } from './context';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Dashboards
import ClientDashboard from './pages/dashboards/ClientDashboard';
import BirthProfilePage from './pages/client/BirthProfilePage';
import MyKundliPage from './pages/client/MyKundliPage';
import PlanetaryAnalysisPage from './pages/client/PlanetaryAnalysisPage';
import PredictionsPage from './pages/client/PredictionsPage';
import ChatPage from './pages/client/ChatPage';
import AstrologerDashboard from './pages/dashboards/AstrologerDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import DashboardSubroute from './pages/dashboards/DashboardSubroute';

// Error & Guard Pages
import AccessDeniedPage from './pages/errors/AccessDeniedPage';
import NotFoundPage from './pages/errors/NotFoundPage';

import './App.css';

/**
 * Core Router & Access Control Manager
 */
const AppRouter = () => {
  const [currentPath] = useCurrentPath();
  const { isAuthenticated, role, setAuthNotice } = useAuth();

  const routeInfo = ROUTE_CONFIG[currentPath];

  // Dynamically update document title based on route metadata
  useEffect(() => {
    if (routeInfo?.title) {
      document.title = routeInfo.title;
    } else {
      document.title = 'Veda AI | Ancient Wisdom, Intelligent Insights';
    }
  }, [routeInfo, currentPath]);

  // Handle 404 Not Found for unregistered routes
  if (!routeInfo) {
    return <NotFoundPage />;
  }

  // Handle Public Routes
  if (routeInfo.isPublic) {
    switch (currentPath) {
      case ROUTES.LOGIN:
        return <LoginPage />;
      case ROUTES.REGISTER:
        return <RegisterPage />;
      case ROUTES.FORGOT_PASSWORD:
        return <ForgotPasswordPage />;
      case ROUTES.HOME:
      default:
        return <LandingPage />;
    }
  }

  // Guard 1: Authentication Requirement
  if (!isAuthenticated) {
    // Save reason and redirect to login
    setAuthNotice(`Sign in required to access ${routeInfo.title.split('|')[0].trim() || 'this protected area'}.`);
    navigate(ROUTES.LOGIN);
    return <LoginPage />;
  }

  // Guard 2: Role Authorization Matrix
  const isRoleAllowed = routeInfo.allowedRoles?.includes(role);
  if (!isRoleAllowed) {
    return (
      <AccessDeniedPage
        attemptedPath={currentPath}
        allowedRoles={routeInfo.allowedRoles || [ROLES.ADMIN]}
      />
    );
  }

  // Render Authorized Views & Subroutes
  switch (currentPath) {
    // Client Area
    case ROUTES.CLIENT_DASHBOARD:
      return <ClientDashboard />;
    case ROUTES.CLIENT_PROFILE:
      return <BirthProfilePage />;
    case ROUTES.CLIENT_KUNDLI:
      return <MyKundliPage />;
    case ROUTES.CLIENT_PLANETARY_ANALYSIS:
      return <PlanetaryAnalysisPage />;
    case ROUTES.CLIENT_PREDICTIONS:
      return <PredictionsPage />;
    case ROUTES.CLIENT_CHAT:
      return <ChatPage />;

    // Astrologer Area
    case ROUTES.ASTROLOGER_DASHBOARD:
      return <AstrologerDashboard />;
    case ROUTES.ASTROLOGER_CLIENTS:
      return (
        <DashboardSubroute
          title="Client Directory"
          category="Astrologer"
          parentDashboard={ROUTES.ASTROLOGER_DASHBOARD}
          description="Browse registered seekers, review submitted birth details, and track active consultation cycles."
        />
      );
    case ROUTES.ASTROLOGER_VERIFICATIONS:
      return (
        <DashboardSubroute
          title="Verification Queue"
          category="Astrologer"
          parentDashboard={ROUTES.ASTROLOGER_DASHBOARD}
          description="Review automated astrological interpretations, certify mathematical ephemeris values, and approve remedy protocols."
        />
      );
    case ROUTES.ASTROLOGER_REPORTS:
      return (
        <DashboardSubroute
          title="Astrological Reports"
          category="Astrologer"
          parentDashboard={ROUTES.ASTROLOGER_DASHBOARD}
          description="Generate and certify in-depth planetary transit dossiers and Kundli Milan compatibility assessments."
        />
      );

    // Admin Area
    case ROUTES.ADMIN_DASHBOARD:
      return <AdminDashboard />;
    case ROUTES.ADMIN_USERS:
      return (
        <DashboardSubroute
          title="User Management"
          category="Admin"
          parentDashboard={ROUTES.ADMIN_DASHBOARD}
          description="Manage platform user accounts, authentication credentials, and active subscription memberships."
        />
      );
    case ROUTES.ADMIN_ASTROLOGERS:
      return (
        <DashboardSubroute
          title="Astrologer Network"
          category="Admin"
          parentDashboard={ROUTES.ADMIN_DASHBOARD}
          description="Review certified practitioner credentials, verification status, and quality ratings."
        />
      );
    case ROUTES.ADMIN_VERIFICATIONS:
      return (
        <DashboardSubroute
          title="Platform Verifications"
          category="Admin"
          parentDashboard={ROUTES.ADMIN_DASHBOARD}
          description="Audit platform calculation metrics, verification queues, and system telemetry."
        />
      );

    default:
      return <NotFoundPage />;
  }
};

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
