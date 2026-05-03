import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCookie } from '@/src/contexts/CookieContext';
import { Button } from '@/src/components/ui/Button';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ShieldCheck, PieChart, Target, Info } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function CookieBanner() {
  const { hasDecided, acceptAll, rejectAll, saveCustom } = useCookie();
  const [showCustom, setShowCustom] = React.useState(false);
  const [delayedShow, setDelayedShow] = React.useState(false);
  
  // Custom states
  const [analytics, setAnalytics] = React.useState(true);
  const [advertising, setAdvertising] = React.useState(true);

  React.useEffect(() => {
    if (!hasDecided) {
      const timer = setTimeout(() => setDelayedShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [hasDecided]);

  if (hasDecided || !delayedShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 200, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 p-4 md:p-8 z-[100] pointer-events-none"
      >
        <div className="max-w-7xl mx-auto flex justify-end">
          <motion.div 
            layout
            className={cn(
              "w-full md:w-[420px] bg-background-card border border-border-subtle rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 pointer-events-auto",
              "backdrop-blur-xl bg-background-card/95"
            )}
          >
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent-green/10 flex items-center justify-center text-accent-green shrink-0">
                  <span className="text-2xl">🍪</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-display font-black uppercase tracking-tight text-white leading-none">
                    Cookies & Confidentialité
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et afficher des publicités pertinentes sur notre blog.
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {showCustom && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-4 pt-4 border-t border-border-subtle"
                  >
                    {/* Essentials */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-background-secondary/50">
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={18} className="text-text-tertiary" />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white">Essentiels</p>
                          <p className="text-[10px] text-text-tertiary">Session, Sécurité, Authentification</p>
                        </div>
                      </div>
                      <div className="w-10 h-5 rounded-full bg-accent-green/50 relative opacity-50 cursor-not-allowed">
                        <div className="absolute right-1 top-1 w-3 h-3 rounded-full bg-white" />
                      </div>
                    </div>

                    {/* Analytics */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-background-secondary/50">
                      <div className="flex items-center gap-3">
                        <PieChart size={18} className="text-accent-green" />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white">Analytiques</p>
                          <p className="text-[10px] text-text-tertiary">Fréquentation, vues d'articles</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAnalytics(!analytics)}
                        className={cn(
                          "w-10 h-5 rounded-full relative transition-colors",
                          analytics ? "bg-accent-green" : "bg-background-tertiary"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                          analytics ? "left-6" : "left-1"
                        )} />
                      </button>
                    </div>

                    {/* Marketing */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-background-secondary/50">
                      <div className="flex items-center gap-3">
                        <Target size={18} className="text-purple-500" />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white">Publicitaires</p>
                          <p className="text-[10px] text-text-tertiary">Performance des annonces, clics</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAdvertising(!advertising)}
                        className={cn(
                          "w-10 h-5 rounded-full relative transition-colors",
                          advertising ? "bg-purple-500" : "bg-background-tertiary"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                          advertising ? "left-6" : "left-1"
                        )} />
                      </button>
                    </div>

                    <Button 
                      fullWidth 
                      className="h-12 bg-accent-green text-black font-black uppercase tracking-widest text-[10px]"
                      onClick={() => saveCustom(analytics, advertising)}
                    >
                      Enregistrer mes préférences
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {!showCustom && (
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    fullWidth 
                    className="h-14 bg-accent-green text-black font-black uppercase tracking-widest text-xs"
                    onClick={acceptAll}
                  >
                    Tout accepter
                  </Button>
                  <Button 
                    fullWidth 
                    variant="outline"
                    className="h-14 border-border-subtle text-white font-black uppercase tracking-widest text-xs"
                    onClick={rejectAll}
                  >
                    Tout refuser
                  </Button>
                  <div className="flex items-center justify-between pt-2">
                    <button 
                      onClick={() => setShowCustom(!showCustom)}
                      className="text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-white transition-colors flex items-center gap-2"
                    >
                      {showCustom ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Personnaliser
                    </button>
                    <Link 
                      to="/cookies"
                      className="text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-accent-green transition-colors flex items-center gap-1"
                    >
                      <Info size={12} /> En savoir plus
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
