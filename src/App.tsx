import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { ProtectedRoute, ManagerRoute, AdminRoute } from '@/src/components/auth/ProtectedRoute';
import Navbar from '@/src/components/layout/Navbar';
import BottomNav from '@/src/components/layout/BottomNav';
import { Footer } from '@/src/components/layout/Footer';
import { ToastProvider } from '@/src/components/ui/Toast';
import { PageLoader } from '@/src/components/ui/PageLoader';

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
import DashboardLayout from '@/src/components/DashboardLayout';
import ManagerOnboarding from '@/src/pages/ManagerOnboarding';
import DashboardHome from '@/src/pages/dashboard/DashboardHome';
import DashboardTerrains from '@/src/pages/dashboard/DashboardTerrains';
import DashboardRecurrences from '@/src/pages/dashboard/DashboardRecurrences';
import DashboardAcademies from '@/src/pages/dashboard/DashboardAcademies';
import DashboardReservations from '@/src/pages/dashboard/DashboardReservations';
import DashboardSettings from '@/src/pages/dashboard/DashboardSettings';

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
  const { isLoading } = useAuth();
  
  if (isLoading) return <PageLoader />;

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
        
        {/* Admin Blog Routes */}
        <Route
          path="/admin/blog"
          element={
            <AdminRoute>
              <PageTransition>
                <BlogCMSList />
              </PageTransition>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/blog/nouveau"
          element={
            <AdminRoute>
              <PageTransition>
                <BlogCMSEditor />
              </PageTransition>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/blog/:id/modifier"
          element={
            <AdminRoute>
              <PageTransition>
                <BlogCMSEditor />
              </PageTransition>
            </AdminRoute>
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
              <div className="pt-32 px-6 text-center">
                <h1 className="text-4xl mb-4 text-white">404</h1>
                <p className="text-text-secondary">Page non trouvée.</p>
              </div>
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-background-primary text-text-primary selection:bg-accent-green/30 selection:text-accent-green overflow-x-hidden">
              <Navbar />
              <main>
                <AnimatedRoutes />
              </main>
              <Footer />
              <BottomNav />
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

