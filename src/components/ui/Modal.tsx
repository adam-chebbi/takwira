import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useMediaQuery } from '@/src/hooks/useMediaQuery';
import { BottomSheet } from './BottomSheet';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
        <div className="space-y-6">
           {children}
           {footer && (
             <div className="flex flex-col gap-3 pb-8">
               {footer}
             </div>
           )}
        </div>
      </BottomSheet>
    );
  }

  const sizes = {
    sm: 'max-w-[400px]',
    md: 'max-w-[560px]',
    lg: 'max-w-[720px]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "relative w-full bg-background-card border border-border-subtle rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden",
              sizes[size]
            )}
          >
            <div className="p-8 pb-4 flex items-center justify-between">
              <h2 className="text-2xl font-display font-black uppercase tracking-tight text-white">{title}</h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-background-secondary border border-border-subtle flex items-center justify-center text-text-tertiary hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
              {children}
            </div>

            {footer && (
              <div className="p-8 pt-4 flex justify-end gap-3 bg-background-secondary/20">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
