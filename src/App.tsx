import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from '@/src/components/layout/Navbar';
import BottomNav from '@/src/components/layout/BottomNav';
import { Footer } from '@/src/components/layout/Footer';
import { ToastProvider } from '@/src/components/ui/Toast';
import Home from '@/src/pages/Home';
import Terrains from '@/src/pages/Terrains';
import TerrainDetail from '@/src/pages/TerrainDetail';
import ReservationFlow from '@/src/pages/ReservationFlow';
import MatchPublic from '@/src/pages/MatchPublic';
import MatchManage from '@/src/pages/MatchManage';
import Auth from '@/src/pages/Auth';
import Profile from '@/src/pages/Profile';
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
  );
}

