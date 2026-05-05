import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface JerseyPreviewProps {
  color: 'red' | 'blue';
  name: string;
  number: string | number;
  size?: 'sm' | 'md' | 'lg';
  isTyping?: boolean;
}

export default function JerseyPreview({ color, name, number, size = 'md', isTyping = false }: JerseyPreviewProps) {
  const containerSizeClass = {
    sm: 'max-w-[120px]',
    md: 'max-w-[280px]',
    lg: 'max-w-[420px]'
  }[size];

  return (
    <div className={cn("relative w-full aspect-[4/5] mx-auto", containerSizeClass)}>
      <motion.div
        animate={!isTyping ? {
          y: [0, -8, 0]
        } : {
          y: 0
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-full h-full relative"
        style={{ 
          perspective: '1000px',
          transform: 'rotateY(2deg)'
        }}
      >
        {/* Jersey Images */}
        <div className="absolute inset-0">
          <div 
            className={cn(
              "absolute inset-0 transition-all duration-500 ease-out",
              color === 'red' ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}
          >
            <img 
              src="/public/tshirt-red.png" 
              alt="Jersey Red" 
              className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
            />
          </div>

          <div 
            className={cn(
              "absolute inset-0 transition-all duration-500 ease-out",
              color === 'blue' ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}
          >
            <img 
              src="/public/tshirt-blue.png" 
              alt="Jersey Blue" 
              className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
            />
          </div>
        </div>

        {/* BACK OVERLAY (NAME & NUMBER) */}
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[70%] flex flex-col items-center pointer-events-none">
          <span className={cn(
            "font-display font-extrabold text-white/90 uppercase tracking-[0.25em] drop-shadow-md",
            size === 'sm' ? "text-[5px] mb-0.5" : size === 'md' ? "text-[9px] mb-1" : "text-[11px] mb-1"
          )}>
            TAKWIRA<span className="text-pl-pink">.</span>
          </span>

          <motion.div
            key={number}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "font-display font-black text-white leading-none mb-1",
              size === 'sm' ? "text-[24px]" : size === 'md' ? "text-[52px]" : "text-[82px]"
            )}
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
          >
            {number}
          </motion.div>

          <motion.div
            key={name}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "font-display font-bold text-white uppercase tracking-widest truncate w-full text-center",
              size === 'sm' ? "text-[7px]" : size === 'md' ? "text-[14px]" : "text-[20px]"
            )}
            style={{ textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}
          >
            {name || "PLAYER"}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
