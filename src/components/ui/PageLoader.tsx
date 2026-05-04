import * as React from 'react';
import { motion } from 'motion/react';

export const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-background-primary flex flex-col items-center justify-center">
      {/* Progress bar at the top */}
      <div className="absolute top-0 left-0 w-full h-1 bg-background-secondary overflow-hidden">
        <motion.div 
          className="h-full bg-accent-green"
          initial={{ width: "0%" }}
          animate={{ width: "70%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </div>

      {/* Pulsing Logo */}
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8] 
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex items-center group" aria-label="Takwira.com">
          <span className="text-4xl font-display font-black tracking-tighter text-pl-purple">TAKWIRA</span>
          <span className="text-4xl font-display font-black tracking-tighter text-pl-pink">.</span>
        </div>
        <div className="w-12 h-0.5 bg-accent-green rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
      </motion.div>
    </div>
  );
};
