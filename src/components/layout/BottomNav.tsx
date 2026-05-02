import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, MapPin, CircleDot, Calendar, User } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { label: 'Accueil', icon: Home, path: '/' },
    { label: 'Terrains', icon: MapPin, path: '/terrains' },
    { label: 'Match', icon: CircleDot, path: '/creer-match', special: true },
    { label: 'Matchs', icon: Calendar, path: '/profil?tab=matchs' },
    { label: 'Profil', icon: User, path: '/profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-background-secondary border-t border-border-subtle h-16 pt-2 pb-[env(safe-area-inset-bottom)] px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between relative h-full max-w-sm mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center gap-1 transition-all relative flex-1 min-w-0",
              isActive || (location.pathname === item.path) ? "text-accent-green" : "text-text-tertiary"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && !item.special && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute -top-1 w-6 h-1 bg-accent-green rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  />
                )}
                
                <div className={cn(
                  "relative",
                  item.special && "bg-accent-green text-black w-11 h-11 rounded-full flex items-center justify-center -translate-y-6 shadow-xl shadow-accent-green/30 border-4 border-background-secondary"
                )}>
                  <item.icon size={item.special ? 22 : 24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                
                {!item.special && (
                  <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
