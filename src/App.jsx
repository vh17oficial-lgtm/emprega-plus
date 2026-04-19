import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SupportProvider } from './context/SupportContext';
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';
import AdminPanel from './pages/AdminPanel';
import LoginPage from './pages/LoginPage';
import TopographyBackground from './components/common/TopographyBackground';
import SupportWidget from './components/common/SupportWidget';
import SiteBanner from './components/common/SiteBanner';
import SeoHead from './components/common/SeoHead';
import MaintenancePage from './components/common/MaintenancePage';

function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, isLoggedIn, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user?.role !== 'admin') return <Navigate to="/usuario" replace />;
  return children;
}

const bgPresets = {
  '/': { backgroundColor: '#0c1122', lineColor: 'rgba(99, 130, 255, 0.10)', lineCount: 18 },
  '/login': { backgroundColor: '#0a0e1f', lineColor: 'rgba(99, 130, 255, 0.12)', lineCount: 20 },
  '/usuario': { backgroundColor: '#f0f2f7', lineColor: 'rgba(99, 130, 200, 0.06)', lineCount: 14, strokeWidth: 0.6 },
  '/admin': { backgroundColor: '#f0f2f7', lineColor: 'rgba(99, 130, 200, 0.06)', lineCount: 14, strokeWidth: 0.6 },
};

function AppBackground() {
  const location = useLocation();
  const preset = bgPresets[location.pathname] || bgPresets['/'];
  return <TopographyBackground {...preset} speed={0.5} />;
}

function MaintenanceGuard({ children }) {
  const { siteConfig } = useAppContext();
  const { user } = useAuth();
  const maint = siteConfig.maintenance;
  if (maint?.enabled && user?.role !== 'admin') {
    return <MaintenancePage title={maint.title} message={maint.message} />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <SupportProvider>
          <BrowserRouter>
            <AppBackground />
            <div className="relative z-10">
              <SiteBanner />
              <SeoHead />
              <MaintenanceGuard>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/usuario" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                  <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
                </Routes>
              </MaintenanceGuard>
            </div>
            <SupportWidget />
          </BrowserRouter>
        </SupportProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
