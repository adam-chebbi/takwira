import * as React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  MapPin, 
  CalendarCheck, 
  RefreshCw, 
  GraduationCap, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Badge } from '@/src/components/ui/Badge';

const NAV_ITEMS = [
  { id: 'home', label: 'Tableau de Bord', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'terrains', label: 'Mes Terrains', icon: MapPin, path: '/dashboard/terrains' },
  { id: 'reservations', label: 'Réservations', icon: CalendarCheck, path: '/dashboard/reservations' },
  { id: 'recurrences', label: 'Récurrences', icon: RefreshCw, path: '/dashboard/recurrences' },
  { id: 'academies', label: 'Académies', icon: GraduationCap, path: '/dashboard/academies' },
  { id: 'parametres', label: 'Paramètres', icon: Settings, path: '/dashboard/parametres' },
];

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Auth Guard Simulation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // Simulation: Only 'manager' role can access
      // In a real app we'd check session/user role
      setIsCheckingAuth(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center space-y-4">
         <div className="w-12 h-12 border-4 border-accent-green/30 border-t-accent-green rounded-full animate-spin" />
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary">Vérification des accès...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[280px] flex-col bg-background-card border-r border-border-subtle fixed h-screen z-50">
         <SidebarContent onLogout={handleLogout} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-overlay z-[100] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-background-card border-r border-border-subtle z-[110] lg:hidden"
            >
               <SidebarContent onLogout={handleLogout} onClose={() => setIsSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-[280px] min-h-screen flex flex-col">
        {/* Top Header Mobile */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 bg-background-card border-b border-border-subtle sticky top-0 z-40">
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center text-text-tertiary"
              >
                <Menu size={20} />
              </button>
              <div className="text-xl font-display font-black italic tracking-tighter text-accent-green bg-black px-2 py-0.5 rounded-sm">
                T<span className="text-white">.</span>
              </div>
           </div>
           <div className="w-8 h-8 rounded-full bg-accent-green flex items-center justify-center text-black font-black text-xs">
              GS
           </div>
        </header>

        <div className="flex-1 overflow-auto">
           <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SidebarContent({ onLogout, onClose }: { onLogout: () => void; onClose?: () => void }) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full py-8">
      {/* Logo */}
      <div className="px-8 mb-12">
        <div className="text-2xl font-display font-black italic tracking-tighter text-accent-green bg-black px-3 py-1 rounded-sm skew-x-[-10deg] w-max mb-6">
          TAKWIRA<span className="text-white">.COM</span>
        </div>
        
        <div className="space-y-1">
           <h3 className="text-lg font-display font-black uppercase tracking-tight text-white">Gammarth Foot Center</h3>
           <Badge className="bg-accent-green/10 text-accent-green border-accent-green/20 uppercase font-black text-[9px] tracking-widest h-6">
             Gérant Vérifié ✓
           </Badge>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={onClose}
            end={item.path === '/dashboard'}
            className={({ isActive }) => cn(
              "flex items-center gap-4 px-8 py-4 transition-all relative group",
              isActive 
                ? "text-accent-green bg-gradient-to-r from-accent-green/[0.08] to-transparent border-l-[3px] border-accent-green" 
                : "text-text-secondary hover:text-white hover:bg-background-secondary border-l-[3px] border-transparent"
            )}
          >
            <item.icon size={20} className={cn("transition-colors", location.pathname === item.path ? "text-accent-green" : "group-hover:text-accent-green")} />
            <span className="text-xs uppercase font-black tracking-widest">{item.label}</span>
            {location.pathname === item.path && (
              <ChevronRight size={14} className="ml-auto opacity-40" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 mt-auto">
         <button 
           onClick={onLogout}
           className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-text-tertiary hover:text-danger hover:bg-danger/5 transition-all text-xs uppercase font-black tracking-widest"
         >
           <LogOut size={20} />
           Déconnexion
         </button>
      </div>
    </div>
  );
}
