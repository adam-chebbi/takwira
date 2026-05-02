import * as React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, User, LogOut, ChevronRight, Menu, X, Plus } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/Button';

export default function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false); // Mock sync
  const [showDropdown, setShowDropdown] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Terrains', path: '/terrains' },
    { label: 'Matchs', path: '/matches' },
    { label: 'Tournois', path: '/tournaments' },
    { label: 'Académies', path: '/academies' },
    { label: 'Support', path: '/aide' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-12 h-20 flex items-center justify-between",
      scrolled ? "bg-background-secondary/90 backdrop-blur-xl border-b border-border-subtle h-16" : "bg-transparent"
    )}>
      {/* Logo */}
      <Link to="/" className="flex items-center group">
        <span className="text-2xl font-display font-black tracking-tight text-accent-green">TAKWIRA</span>
        <span className="text-2xl font-display font-black tracking-tight text-text-tertiary">.com</span>
      </Link>

      {/* Desktop Links */}
      <div className="hidden lg:flex items-center gap-10">
        {navLinks.map((link) => (
          <NavLink 
            key={link.path}
            to={link.path}
            className={({ isActive }) => cn(
              "text-sm font-semibold transition-all relative py-2",
              isActive || (location.pathname === link.path) ? "text-white" : "text-text-secondary hover:text-white"
            )}
          >
            {link.label}
            {(location.pathname === link.path) && (
              <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-green" />
            )}
          </NavLink>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        {!isLoggedIn ? (
          <div className="flex items-center gap-4">
            <Link to="/connexion" className="text-sm font-bold text-text-secondary hover:text-white hidden sm:block">
              Connexion
            </Link>
            <Button className="h-10 px-6 rounded-full font-black uppercase text-[10px] tracking-widest gap-2 bg-accent-green hover:bg-accent-green/80 text-black">
              <Plus size={16} /> Créer un Match
            </Button>
            <button className="lg:hidden text-white" onClick={() => setIsLoggedIn(true)}>
               <User size={24} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-6 relative">
             <button className="relative text-text-tertiary hover:text-white transition-colors">
                <Bell size={22} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[10px] font-black rounded-full flex items-center justify-center">3</span>
             </button>
             
             <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-10 h-10 rounded-full border-2 border-accent-green/20 p-0.5 hover:border-accent-green transition-all"
                >
                   <div className="w-full h-full rounded-full bg-purple-500 flex items-center justify-center text-xs font-black text-white">AS</div>
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute top-14 right-0 w-64 bg-background-card border border-border-subtle rounded-2xl shadow-2xl p-2 z-50 origin-top-right overflow-hidden"
                      >
                         <div className="p-4 border-b border-border-subtle mb-1">
                            <p className="text-xs font-black uppercase tracking-widest text-text-tertiary">Ahmed Skander</p>
                            <p className="text-[10px] font-bold text-text-secondary">Joueur · Ariana</p>
                         </div>
                         {[
                           { label: 'Mon Profil', icon: User, path: '/profil' },
                           { label: 'Mes Matchs', icon: ChevronRight, path: '/profil?tab=matchs' },
                           { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', manager: true },
                         ].map((item, i) => (
                           <Link 
                            key={i} 
                            to={item.path} 
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-background-secondary transition-all text-sm font-bold text-text-secondary hover:text-white group"
                           >
                              <item.icon size={16} className="text-text-tertiary group-hover:text-accent-green transition-colors" />
                              {item.label}
                           </Link>
                         ))}
                         <button 
                           onClick={() => { setIsLoggedIn(false); setShowDropdown(false); }}
                           className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-danger/10 text-danger transition-all text-sm font-bold text-left"
                         >
                            <LogOut size={16} /> Déconnexion
                         </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
             </div>
          </div>
        )}
      </div>
    </nav>
  );
}

const LayoutDashboard = ({ ...props }) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);
