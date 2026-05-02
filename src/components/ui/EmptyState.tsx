import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  subtitle, 
  actionLabel, 
  onAction, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 space-y-6", className)}>
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 rounded-full bg-background-secondary flex items-center justify-center text-text-tertiary"
      >
        <Icon size={32} />
      </motion.div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-display font-black uppercase tracking-tight text-white">{title}</h3>
        <p className="text-sm font-medium text-text-secondary max-w-xs mx-auto">{subtitle}</p>
      </div>

      {actionLabel && (
        <button 
          onClick={onAction}
          className="bg-accent-green hover:bg-accent-green/90 text-black px-6 h-12 rounded-xl font-black uppercase text-xs tracking-widest transition-all active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
