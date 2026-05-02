import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from '@/src/components/layout/Navbar';
import BottomNav from '@/src/components/layout/BottomNav';
import { Footer } from '@/src/components/layout/Footer';
import { ToastProvider } from '@/src/components/ui/Toast';
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

const AnimatedRoutes = () => {
  const location = useLocation();
  
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
              <ReservationFlow />
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
              <MatchManage />
            </PageTransition>
          }
        />
        <Route
          path="/connexion"
          element={
            <PageTransition>
              <Auth />
            </PageTransition>
          }
        />
        <Route
          path="/profil"
          element={
            <PageTransition>
              <Profile />
            </PageTransition>
          }
        />
        <Route
          path="/inscription-gerant"
          element={
            <PageTransition>
              <ManagerOnboarding />
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
          path="/a-propos"
          element={
            <PageTransition>
              <About />
            </PageTransition>
          }
        />
        <Route path="/dashboard" element={<DashboardLayout />}>
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
                <h1 className="text-4xl mb-4">Page non trouvée</h1>
                <p className="text-text-secondary">Désolé, cette page est en cours de construction.</p>
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
    </HelmetProvider>
  );
}

