import * as React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, User, LogOut, ChevronRight, Plus, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/contexts/AuthContext';
import { useNotifications } from '@/src/hooks/useNotifications';
import { NotificationPanel } from './NotificationPanel';

export default function Navbar() {
  const { user, userProfile, role, signOut } = useAuth();
  const { notifications, unreadCount } = useNotifications(userProfile?.id);
  const [scrolled, setScrolled] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNotificationsClick = () => {
    if (window.innerWidth < 1024) {
      navigate('/notifications');
    } else {
      setShowNotifications(!showNotifications);
    }
  };

  const isLoggedIn = !!user;

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const topLinks = [
    { label: 'À Propos', path: '/a-propos' },
    { label: 'Contact', path: '/contact' },
    { label: 'Blog', path: '/blog' },
    { label: 'Aide', path: '/aide' },
  ];

  const mainLinks = [
    { label: 'Terrains', path: '/terrains' },
    { label: 'Matchs', path: '/matches' },
    { label: 'Comment ça marche', path: '/#comment-ca-marche' },
    { label: 'Pour les Gérants', path: '/inscription-gerant' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] transition-all duration-300">
      {/* SECTION 1: TOP BAR (Slides away) */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 40, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="hidden lg:flex bg-pl-purple text-white/70 border-b border-white/5 items-center justify-between px-12 overflow-hidden"
          >
            <div className="flex gap-8">
              {topLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                1.3k Joueurs actifs
              </span>
              <div className="h-4 w-px bg-white/10" />
              <span className="text-white/40">TUNISIE · {new Date().toLocaleDateString('fr-TN')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 2: MAIN NAVBAR */}
      <nav className={cn(
        "transition-all duration-300 flex items-center justify-between px-6 md:px-12",
        "bg-white/95 backdrop-blur-xl border-b border-border-subtle",
        scrolled ? "h-16 shadow-[0_4px_30px_rgba(0,0,0,0.03)]" : "h-20"
      )}>
        {/* Logo */}
        <Link to="/" className="flex items-center group" aria-label="Takwira.com Home">
          <span className="text-2xl font-display font-black tracking-tighter text-pl-purple">TAKWIRA</span>
          <span className="text-2xl font-display font-black tracking-tighter text-pl-pink">.</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {mainLinks.map((link) => (
            <NavLink 
              key={link.path}
              to={link.path}
              className={({ isActive }) => cn(
                "text-[11px] font-black uppercase tracking-[0.15em] transition-all relative py-2",
                isActive || (location.pathname === link.path) ? "text-pl-purple" : "text-text-secondary hover:text-pl-purple"
              )}
            >
              {link.label}
              {(location.pathname === link.path) && (
                <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-pl-pink" />
              )}
            </NavLink>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          {!isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link to="/connexion" className="text-[11px] font-black text-pl-purple hover:text-pl-purple-dark hidden sm:block uppercase tracking-widest">
                Connexion
              </Link>
              <Button 
                asChild
                className="h-10 px-6 rounded-full font-black uppercase text-[10px] tracking-[0.15em] gap-2 bg-pl-purple hover:bg-pl-purple-dark text-white shadow-xl shadow-pl-purple/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <Link to="/connexion">
                  <Plus size={16} /> Créer un Match
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-6 relative">
               <button 
                 onClick={handleNotificationsClick}
                 className={cn(
                   "relative p-2 rounded-xl text-text-secondary hover:text-pl-purple hover:bg-pl-purple/5 transition-all",
                   showNotifications && "text-pl-purple bg-pl-purple/5"
                 )}
                 aria-label="Toggle notifications"
                 aria-expanded={showNotifications}
               >
                  <Bell size={22} className={cn(showNotifications && "fill-pl-purple")} />
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ 
                          scale: [0, 1.2, 1],
                          transition: { type: "spring", stiffness: 300, damping: 15 }
                        }}
                        exit={{ scale: 0 }}
                        className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
               </button>

               <NotificationPanel 
                 isOpen={showNotifications} 
                 onClose={() => setShowNotifications(false)} 
               />
               
               <div className="relative">
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-10 h-10 rounded-full border-2 border-pl-purple/10 p-0.5 hover:border-pl-purple hover:scale-105 active:scale-95 transition-all overflow-hidden"
                    aria-label="User profile menu"
                    aria-expanded={showDropdown}
                  >
                     {userProfile?.avatarUrl ? (
                       <img src={userProfile.avatarUrl} alt="Your profile avatar" className="w-full h-full object-cover rounded-full" />
                     ) : (
                       <div 
                          className="w-full h-full rounded-full flex items-center justify-center text-[10px] font-black text-white uppercase"
                          style={{ backgroundColor: userProfile?.avatarColor || 'var(--color-pl-purple)' }}
                       >
                         {userProfile?.firstName && userProfile?.lastName 
                           ? `${userProfile.firstName[0]}${userProfile.lastName[0]}`
                           : userProfile?.name?.substring(0, 2) || user?.phoneNumber?.slice(-2)}
                       </div>
                     )}
                  </button>

                  <AnimatePresence>
                    {showDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute top-14 right-0 w-72 bg-white border border-border-subtle rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2 z-50 origin-top-right overflow-hidden"
                        >
                           <div className="p-4 border-b border-border-subtle mb-1 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-pl-purple/10 flex items-center justify-center text-pl-purple font-black text-xs">
                                {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
                              </div>
                              <div>
                                <p className="text-xs font-black uppercase tracking-tight text-pl-purple line-clamp-1">{userProfile?.name}</p>
                                <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">{role} · {userProfile?.city}</p>
                              </div>
                           </div>
                           <div className="p-1 space-y-1">
                             {[
                               { label: 'Mon Profil', icon: User, path: '/profil' },
                               { label: 'Mes Matchs', icon: ChevronRight, path: '/mes-matchs' },
                               { label: 'Dashboard Gérant', icon: LayoutDashboard, path: '/dashboard', show: role === 'manager' || role === 'admin' },
                               { label: 'Administration', icon: ShieldCheck, path: '/admin', show: role === 'admin' },
                             ].filter(item => item.show !== false).map((item, i) => (
                               <Link 
                                key={i} 
                                to={item.path} 
                                onClick={() => setShowDropdown(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-pl-purple/5 transition-all text-xs font-bold text-text-secondary hover:text-pl-purple group"
                               >
                                  <item.icon size={16} className="text-text-secondary group-hover:text-pl-purple transition-colors" />
                                  {item.label}
                               </Link>
                             ))}
                           </div>
                           <div className="p-1 border-t border-border-subtle mt-1">
                             <button 
                               onClick={() => { signOut(); setShowDropdown(false); }}
                               className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-pl-pink/5 text-pl-pink transition-all text-xs font-bold text-left"
                             >
                                <LogOut size={16} /> Déconnexion
                             </button>
                           </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
               </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
