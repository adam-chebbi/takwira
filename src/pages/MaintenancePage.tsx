import * as React from 'react';
import { motion } from 'motion/react';
import { Wrench, Clock } from 'lucide-react';

interface MaintenancePageProps {
  estimatedReturn?: string;
}

export default function MaintenancePage({ estimatedReturn }: MaintenancePageProps) {
  return (
    <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-green/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="relative z-10 max-w-lg w-full text-center space-y-12">
        {/* Logo */}
        <div className="flex justify-center">
          <h1 className="text-4xl font-display font-black uppercase tracking-tighter text-white italic">
            TAK<span className="text-accent-green">WIRA</span>
          </h1>
        </div>

        {/* Animation */}
        <div className="relative">
          <motion.div 
            animate={{ 
              rotate: [0, 10, -10, 0],
              y: [0, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-32 h-32 bg-accent-green/10 text-accent-green rounded-[40px] border border-accent-green/20 flex items-center justify-center mx-auto shadow-2xl shadow-accent-green/10"
          >
            <Wrench size={48} />
          </motion.div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-accent-green/20 blur-md rounded-full" />
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-display font-black uppercase italic text-white tracking-widest">En maintenance</h2>
            <p className="text-text-tertiary text-lg font-medium">
              Nous revenons bientôt avec des améliorations incroyables pour votre expérience Takwira.
            </p>
          </div>

          {estimatedReturn && (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-background-secondary rounded-2xl border border-border-subtle animate-pulse">
              <Clock size={18} className="text-accent-green" />
              <span className="text-xs font-black uppercase tracking-widest text-white">
                Retour estimé : {estimatedReturn}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
