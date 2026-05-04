import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, motion } from 'motion/react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Shield } from 'lucide-react';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { ProtectedRoute, ManagerRoute, AdminRoute } from '@/src/components/auth/ProtectedRoute';
import Navbar from '@/src/components/layout/Navbar';
import BottomNav from '@/src/components/layout/BottomNav';
import { Footer } from '@/src/components/layout/Footer';
import { ToastProvider, useToast } from '@/src/components/ui/Toast';
import { PageLoader } from '@/src/components/ui/PageLoader';
import { CookieBanner } from '@/src/components/ui/CookieBanner';
import { PWAInstallBanner } from '@/src/components/ui/PWAInstallBanner';

import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import NotFound from '@/src/pages/NotFound';
import MaintenancePage from '@/src/pages/MaintenancePage';

// Pages
import Home from '@/src/pages/Home';
import Terrains from '@/src/pages/Terrains';
import TerrainDetail from '@/src/pages/TerrainDetail';
import ReservationFlow from '@/src/pages/ReservationFlow';
import Matches from '@/src/pages/Matches';
import Tournaments from '@/src/pages/Tournaments';
import Academies from '@/src/pages/Academies';
import MatchPublic from '@/src/pages/MatchPublic';
import MatchManage from '@/src/pages/MatchManage';
import CreateMatch from '@/src/pages/CreateMatch';
import MyMatches from '@/src/pages/MyMatches';
import Auth from '@/src/pages/Auth';
import Profile from '@/src/pages/Profile';
import HelpCenter from '@/src/pages/HelpCenter';
import Terms from '@/src/pages/Terms';
import Privacy from '@/src/pages/Privacy';
import Contact from '@/src/pages/Contact';
import About from '@/src/pages/About';
import BlogList from '@/src/pages/BlogList';
import BlogPostDetail from '@/src/pages/BlogPostDetail';
import BlogCMSList from '@/src/pages/BlogCMSList';
import BlogCMSEditor from '@/src/pages/BlogCMSEditor';
import AdminAds from '@/src/pages/AdminAds';
import CookiePolicy from '@/src/pages/CookiePolicy';
import DashboardLayout from '@/src/components/DashboardLayout';
import ManagerOnboarding from '@/src/pages/ManagerOnboarding';
import DashboardHome from '@/src/pages/dashboard/DashboardHome';
import DashboardTerrains from '@/src/pages/dashboard/DashboardTerrains';
import DashboardRecurrences from '@/src/pages/dashboard/DashboardRecurrences';
import DashboardAcademies from '@/src/pages/dashboard/DashboardAcademies';
import DashboardReservations from '@/src/pages/dashboard/DashboardReservations';
import DashboardSettings from '@/src/pages/dashboard/DashboardSettings';
import AdminLayout from '@/src/components/AdminLayout';
import AdminDashboard from '@/src/pages/admin/AdminDashboard';
import AdminComplexes from '@/src/pages/admin/AdminComplexes';
import AdminUsers from '@/src/pages/admin/AdminUsers';
import AdminReservations from '@/src/pages/admin/AdminReservations';
import AdminSettings from '@/src/pages/admin/AdminSettings';

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, role, isLoading } = useAuth();
  
  if (isLoading) return <PageLoader />;
  if (user) {
    if (role === 'manager') return <Navigate to="/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { isLoading, isMaintenanceMode, maintenanceReturnTime, role } = useAuth();
  
  if (isLoading) return <PageLoader />;

  if (isMaintenanceMode && role !== 'admin') {
    return <MaintenancePage estimatedReturn={maintenanceReturnTime || undefined} />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/terrains"
          element={
            <PageTransition>
              <Terrains />
            </PageTransition>
          }
        />
        <Route
          path="/terrains/:id"
          element={
            <PageTransition>
              <TerrainDetail />
            </PageTransition>
          }
        />
        <Route
          path="/matches"
          element={
            <PageTransition>
              <Matches />
            </PageTransition>
          }
        />
        <Route
          path="/tournaments"
          element={
            <PageTransition>
              <Tournaments />
            </PageTransition>
          }
        />
        <Route
          path="/academies"
          element={
            <PageTransition>
              <Academies />
            </PageTransition>
          }
        />
        <Route
          path="/reserver/:id"
          element={
            <PageTransition>
              <ProtectedRoute>
                <ReservationFlow />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/match/:token"
          element={
            <PageTransition>
              <MatchPublic />
            </PageTransition>
          }
        />
        <Route
          path="/match/:token/manage"
          element={
            <PageTransition>
              <ProtectedRoute>
                <MatchManage />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/creer-match"
          element={
            <PageTransition>
              <ProtectedRoute>
                <CreateMatch />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/mes-matchs"
          element={
            <PageTransition>
              <ProtectedRoute>
                <MyMatches />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/connexion"
          element={
            <PageTransition>
              <PublicRoute>
                <Auth />
              </PublicRoute>
            </PageTransition>
          }
        />
        <Route
          path="/profil"
          element={
            <PageTransition>
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/inscription-gerant"
          element={
            <PageTransition>
              <ProtectedRoute>
                <ManagerOnboarding />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/aide"
          element={
            <PageTransition>
              <HelpCenter />
            </PageTransition>
          }
        />
        <Route
          path="/terms"
          element={
            <PageTransition>
              <Terms />
            </PageTransition>
          }
        />
        <Route
          path="/privacy"
          element={
            <PageTransition>
              <Privacy />
            </PageTransition>
          }
        />
        <Route
          path="/contact"
          element={
            <PageTransition>
              <Contact />
            </PageTransition>
          }
        />
        <Route
          path="/blog"
          element={
            <PageTransition>
              <BlogList />
            </PageTransition>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <PageTransition>
              <BlogPostDetail />
            </PageTransition>
          }
        />
        
        {/* Admin Dashboard */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="complexes" element={<AdminComplexes />} />
          <Route path="utilisateurs" element={<AdminUsers />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="blog" element={<BlogCMSList />} />
          <Route path="blog/nouveau" element={<BlogCMSEditor />} />
          <Route path="blog/:id/modifier" element={<BlogCMSEditor />} />
          <Route path="publicites" element={<AdminAds />} />
          <Route path="parametres" element={<AdminSettings />} />
        </Route>

        <Route
          path="/cookies"
          element={
            <PageTransition>
              <CookiePolicy />
            </PageTransition>
          }
        />
        <Route
          path="/a-propos"
          element={
            <PageTransition>
              <About />
            </PageTransition>
          }
        />
        
        {/* Manager Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ManagerRoute>
              <DashboardLayout />
            </ManagerRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="terrains" element={<DashboardTerrains />} />
          <Route path="recurrences" element={<DashboardRecurrences />} />
          <Route path="academies" element={<DashboardAcademies />} />
          <Route path="parametres" element={<DashboardSettings />} />
          <Route path="reservations" element={<DashboardReservations />} />
        </Route>

        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function AppContent() {
  const { toast } = useToast();
  const [isOffline, setIsOffline] = React.useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  // PWA Service Worker Registration
  useRegisterSW({
    onNeedRefresh() {
      toast("Une nouvelle version de Takwira est disponible", "info", {
        label: "Actualiser",
        onClick: () => window.location.reload()
      });
    },
  });

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background-primary text-text-primary selection:bg-pl-purple/30 selection:text-pl-purple overflow-x-hidden">
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            exit={{ y: -50 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-pl-purple text-white px-4 py-2 flex items-center justify-center gap-2 border-b border-white/10 shadow-lg"
          >
            <Shield size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Mode hors ligne — Données potentiellement expirées
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <Navbar />
      <main>
        <ErrorBoundary>
          <AnimatedRoutes />
        </ErrorBoundary>
      </main>
      <Footer />
      <BottomNav />
      <CookieBanner />
      <PWAInstallBanner />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <AppContent />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

