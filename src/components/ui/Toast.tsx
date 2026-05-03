import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  (message: string, type?: ToastType): void;
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const success = React.useCallback((message: string) => toast(message, 'success'), [toast]);
  const error = React.useCallback((message: string) => toast(message, 'error'), [toast]);
  const warning = React.useCallback((message: string) => toast(message, 'warning'), [toast]);
  const info = React.useCallback((message: string) => toast(message, 'info'), [toast]);

  const contextValue = React.useMemo(() => {
    const fn = toast as any;
    fn.toast = toast;
    fn.success = success;
    fn.error = error;
    fn.warning = warning;
    fn.info = info;
    return fn as ToastContextType;
  }, [toast, success, error, warning, info]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed z-[100] flex flex-col gap-3 pointer-events-none 
        bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[90vw] md:max-w-none
        md:bottom-auto md:top-8 md:right-8 md:left-auto md:translate-x-0 md:items-end">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={() => setToasts(prev => prev.filter(item => item.id !== t.id))} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void; key?: React.Key }) {
  const icons = {
    success: <CheckCircle2 className="text-accent-green" size={20} />,
    error: <AlertCircle className="text-danger" size={20} />,
    info: <Info className="text-blue-400" size={20} />,
    warning: <AlertTriangle className="text-warning" size={20} />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="pointer-events-auto bg-background-card border border-border-subtle p-4 rounded-xl shadow-2xl flex items-center gap-4 min-w-[300px] max-w-sm relative overflow-hidden"
    >
      <div className="shrink-0">{icons[toast.type]}</div>
      <p className="flex-1 text-sm font-medium text-white line-clamp-2">{toast.message}</p>
      <button onClick={onClose} className="text-text-tertiary hover:text-white transition-colors">
        <X size={18} />
      </button>
      
      {/* Progress Bar */}
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 4, ease: 'linear' }}
        className={cn(
          "absolute bottom-0 left-0 h-1",
          toast.type === 'success' ? 'bg-accent-green' :
          toast.type === 'error' ? 'bg-danger' :
          toast.type === 'info' ? 'bg-blue-400' : 'bg-warning'
        )}
      />
    </motion.div>
  );
}
