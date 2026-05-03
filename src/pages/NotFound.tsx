import * as React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background-primary overflow-hidden">
      <div className="relative text-center">
        {/* Animated 404 text */}
        <div className="relative flex items-center justify-center font-display leading-none">
          <span className="text-[200px] md:text-[300px] font-black italic text-accent-green opacity-10">4</span>
          <motion.span 
            animate={{ 
              y: [0, -40, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="text-[200px] md:text-[300px] font-black italic text-accent-green"
          >
            0
          </motion.span>
          <span className="text-[200px] md:text-[300px] font-black italic text-accent-green opacity-10">4</span>
        </div>

        {/* Subtitle */}
        <div className="relative z-10 -mt-10 md:-mt-20 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-4xl font-display font-black uppercase text-white tracking-widest italic">Cette page n'existe pas</h2>
            <p className="text-text-tertiary text-sm md:text-lg">Désolé, il semble que ce terrain est introuvable.</p>
          </div>
          
          <Button 
            onClick={() => navigate('/')}
            className="h-16 px-10 uppercase font-black tracking-widest shadow-2xl shadow-accent-green/20"
          >
            Retourner à l'accueil
          </Button>
        </div>

        {/* Decorative background blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-green/10 rounded-full blur-[150px] pointer-events-none" />
      </div>
    </div>
  );
}
