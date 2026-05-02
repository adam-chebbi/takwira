import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm lg:hidden"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
            className="fixed inset-x-0 bottom-0 z-[160] bg-background-card border-t border-border-subtle rounded-t-[32px] lg:hidden flex flex-col max-h-[95vh]"
          >
            {/* Drag Handle */}
            <div className="h-8 flex items-center justify-center touch-none">
              <div className="w-12 h-1 bg-border-subtle rounded-full" />
            </div>

            {title && (
              <div className="px-6 pb-4 flex items-center justify-between">
                <h3 className="text-xl font-display font-black uppercase tracking-tight text-white">{title}</h3>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-background-secondary border border-border-subtle flex items-center justify-center text-text-tertiary"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 pb-10">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
