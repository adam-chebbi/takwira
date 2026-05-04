import * as React from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart2, 
  MapPin, 
  CalendarCheck, 
  Users, 
  FileText, 
  Megaphone, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Badge } from '@/src/components/ui/Badge';
import { useAuth } from '@/src/contexts/AuthContext';

const NAV_ITEMS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart2, path: '/admin' },
  { id: 'complexes', label: 'Complexes & Terrains', icon: MapPin, path: '/admin/complexes' },
  { id: 'reservations', label: 'Réservations', icon: CalendarCheck, path: '/admin/reservations' },
  { id: 'users', label: 'Utilisateurs', icon: Users, path: '/admin/utilisateurs' },
  { id: 'blog', label: 'Blog', icon: FileText, path: '/admin/blog' },
  { id: 'ads', label: 'Publicités', icon: Megaphone, path: '/admin/publicites' },
  { id: 'settings', label: 'Paramètres Plateforme', icon: Settings, path: '/admin/parametres' },
];

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { userProfile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background-primary flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[280px] flex-col bg-background-card border-r border-border-subtle fixed h-screen z-50">
         <SidebarContent userProfile={userProfile} onLogout={handleLogout} />
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
               <SidebarContent userProfile={userProfile} onLogout={handleLogout} onClose={() => setIsSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-[280px] min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-background-card border-b border-border-subtle sticky top-0 z-40">
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center text-text-tertiary"
              >
                <Menu size={20} />
              </button>
              <div className="hidden lg:flex items-center gap-2">
                 <ShieldCheck size={18} className="text-blue-500" />
                 <span className="text-xs font-black uppercase tracking-widest text-text-secondary">Console d'administration</span>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <Link 
                to="/" 
                target="_blank"
                className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-white transition-colors"
              >
                Voir le site public <ExternalLink size={12} />
              </Link>
              
              <div className="flex items-center gap-3 pr-2">
                 <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-white">{userProfile?.name || 'Admin'}</p>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Admin Plateforme</p>
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black">
                    {userProfile?.name?.substring(0, 2).toUpperCase() || 'AD'}
                 </div>
              </div>
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
                className="p-4 md:p-8"
              >
                <Outlet />
              </motion.div>
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SidebarContent({ userProfile, onLogout, onClose }: { userProfile: any; onLogout: () => void; onClose?: () => void }) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full py-8">
      {/* Logo */}
      <Link to="/" className="flex items-center group mb-8" aria-label="Takwira.com Home">
        <span className="text-2xl font-display font-black tracking-tighter text-pl-purple">TAKWIRA</span>
        <span className="text-2xl font-display font-black tracking-tighter text-pl-pink">.</span>
      </Link>
        
        <div className="space-y-1 px-8">
           <h3 className="text-lg font-display font-black uppercase tracking-tight text-white">Operations Center</h3>
           <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 uppercase font-black text-[9px] tracking-widest h-6">
             Accès Maître
           </Badge>
        </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={onClose}
            end={item.id === 'overview'}
            className={({ isActive }) => cn(
              "flex items-center gap-4 px-8 py-4 transition-all relative group",
              isActive 
                ? "text-blue-500 bg-gradient-to-r from-blue-500/[0.08] to-transparent border-l-[3px] border-blue-500" 
                : "text-text-secondary hover:text-white hover:bg-background-secondary border-l-[3px] border-transparent"
            )}
          >
            <item.icon size={20} className={cn("transition-colors", (location.pathname === item.path || (item.id === 'overview' && location.pathname === '/admin')) ? "text-blue-500" : "group-hover:text-blue-500")} />
            <span className="text-xs uppercase font-black tracking-widest">{item.label}</span>
            {(location.pathname === item.path || (item.id === 'overview' && location.pathname === '/admin')) && (
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
