import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Share, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/src/lib/utils';

export function PWAInstallBanner() {
  const [show, setShow] = React.useState(false);
  const [platform, setPlatform] = React.useState<'android' | 'ios' | null>(null);
  const deferredPrompt = React.useRef<any>(null);

  React.useEffect(() => {
    // Check if dismissed recently
    const dismissedAt = localStorage.getItem('takwira_install_dismissed');
    if (dismissedAt) {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(dismissedAt) < sevenDays) return;
    }

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;

    if (isIOS && !isStandalone) {
      setPlatform('ios');
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android/Chrome
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setPlatform('android');
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    deferredPrompt.current = null;
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('takwira_install_dismissed', Date.now().toString());
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-24 md:bottom-8 md:right-8 z-50 w-full md:w-[360px] px-4 md:px-0"
        >
          <div className="bg-[#1C1C26] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 relative overflow-hidden group">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            
            <button 
              onClick={dismiss}
              className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex gap-4 items-start">
              <div className="w-14 h-14 rounded-xl bg-pl-green flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,255,133,0.3)]">
                <span className="text-black font-display font-black text-xl italic tracking-tighter">TK</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-bold text-white text-lg leading-tight mb-1 uppercase tracking-tight">
                  Installe Takwira
                </h4>
                <p className="text-text-secondary text-xs leading-snug">
                  Accès rapide depuis ton écran d'accueil
                </p>
              </div>
            </div>

            <div className="mt-5">
              {platform === 'android' ? (
                <Button 
                  onClick={handleInstall}
                  className="w-full h-11 bg-pl-green hover:bg-pl-green/90 text-black font-black uppercase tracking-widest text-[10px]"
                >
                  Installer <ArrowRight className="ml-2" size={14} />
                </Button>
              ) : (
                <div className="flex items-center gap-3 py-2 px-3 bg-white/5 rounded-xl border border-white/5">
                  <Share className="text-pl-green" size={18} />
                  <p className="text-[10px] font-medium text-text-muted leading-tight">
                    Appuie sur <span className="text-white">Partager</span> puis <span className="text-white">"Sur l'écran d'accueil"</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
