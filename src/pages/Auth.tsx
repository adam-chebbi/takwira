import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Loader2, 
  ChevronRight, 
  ArrowLeft, 
  Users, 
  Building2, 
  MapPin, 
  Check,
  Smartphone
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { cn } from '@/src/lib/utils';

type Step = 'PHONE' | 'OTP' | 'ROLE' | 'SETUP';

const GOVERNORATES = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Bizerte", "Nabeul", "Zaghouan", "Béja", 
  "Jendouba", "Le Kef", "Siliana", "Sousse", "Monastir", "Mahdia", "Sfax", "Kairouan", 
  "Kasserine", "Sidi Bouzid", "Gabès", "Médenine", "Tataouine", "Gafsa", "Tozeur", "Kebili"
];

export default function Auth() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState<Step>('PHONE');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [otp, setOtp] = React.useState(['', '', '', '', '', '']);
  const otpRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = React.useState(59);
  const [role, setRole] = React.useState<'PLAYER' | 'MANAGER' | null>(null);

  // OTP Countdown
  React.useEffect(() => {
    let timer: number;
    if (currentStep === 'OTP' && countdown > 0) {
      timer = window.setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [currentStep, countdown]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 8) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep('OTP');
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '')) {
      handleOtpSubmit(newOtp.join(''));
    }
  };

  const handleOtpSubmit = (code: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // For demo, assume first time user
      setCurrentStep('ROLE');
    }, 1500);
  };

  const handleRoleSelect = (selectedRole: 'PLAYER' | 'MANAGER') => {
    setRole(selectedRole);
    if (selectedRole === 'PLAYER') {
      setCurrentStep('SETUP');
    } else {
      navigate('/inscription-gerant'); 
    }
  };

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-green/5 blur-[120px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-[480px] p-8 md:p-10 bg-background-card border-border-subtle rounded-[32px] shadow-2xl relative z-10 overflow-hidden">
        {/* Logo Animation */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 100 }}
          className="flex justify-center mb-10"
        >
          <div className="text-3xl font-display font-black italic tracking-tighter text-accent-green bg-black px-4 py-1 rounded-sm skew-x-[-10deg]">
            TAKWIRA<span className="text-white">.COM</span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {currentStep === 'PHONE' && (
            <motion.div 
              key="phone"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-8"
            >
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight leading-none">Bienvenue sur Takwira</h2>
                <p className="text-text-secondary text-sm font-medium">Connecte-toi ou crée ton compte avec ton numéro tunisien.</p>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div className="space-y-2">
                   <div className="relative group">
                      <div className="absolute left-0 top-0 bottom-0 w-16 bg-background-secondary border-r border-border-subtle rounded-l-xl flex items-center justify-center font-bold text-text-secondary group-focus-within:text-accent-green group-focus-within:border-accent-green/30 transition-all">
                         +216
                      </div>
                      <input 
                        required
                        type="tel"
                        maxLength={8}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-background-secondary border border-border-subtle focus:border-accent-green focus:outline-none rounded-xl pl-20 pr-4 h-16 font-sans text-xl tracking-[0.2em] font-bold transition-all"
                        placeholder="00 000 000"
                      />
                   </div>
                   <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest px-1">
                     Un code de vérification sera envoyé par SMS
                   </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || phoneNumber.length !== 8}
                  className="w-full h-16 text-lg font-black uppercase tracking-widest shadow-2xl shadow-accent-green/20"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Recevoir le code SMS"}
                </Button>
              </form>
            </motion.div>
          )}

          {currentStep === 'OTP' && (
            <motion.div 
              key="otp"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <button 
                  onClick={() => setCurrentStep('PHONE')}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-accent-green transition-colors mb-4"
                >
                  <ArrowLeft size={14} /> Modifier le numéro
                </button>
                <h2 className="text-3xl font-display font-black uppercase tracking-tight">Vérifie ton numéro</h2>
                <p className="text-text-secondary text-sm font-medium">
                  Nous avons envoyé un code à <span className="text-white">+216 {phoneNumber}</span>
                </p>
              </div>

              <div className="flex justify-between gap-2 md:gap-4">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && i > 0) {
                        otpRefs.current[i - 1]?.focus();
                      }
                    }}
                    className="w-full h-14 md:h-16 bg-background-secondary border border-border-subtle focus:border-accent-green focus:shadow-[0_0_15px_rgba(0,255,135,0.2)] focus:outline-none rounded-xl text-center text-2xl font-display font-black transition-all"
                  />
                ))}
              </div>

              <div className="text-center pt-4">
                {countdown > 0 ? (
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                    Renvoyer le code dans {countdown}s
                  </p>
                ) : (
                  <button className="text-[10px] font-black uppercase tracking-widest text-accent-green hover:underline">
                    Renvoyer le code
                  </button>
                )}
              </div>

              <Button 
                onClick={() => handleOtpSubmit(otp.join(''))}
                disabled={isLoading || otp.some(d => d === '')}
                className="w-full h-16 font-black uppercase tracking-widest"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Vérifier"}
              </Button>
            </motion.div>
          )}

          {currentStep === 'ROLE' && (
            <motion.div 
              key="role"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-8"
            >
              <div className="text-center md:text-left space-y-1">
                <h2 className="text-3xl font-display font-black uppercase tracking-tight">Tu es...</h2>
                <p className="text-text-secondary text-sm font-medium">Ton aventure Takwira commence ici.</p>
              </div>

              <div className="space-y-4">
                 <button 
                  onClick={() => handleRoleSelect('PLAYER')}
                  className="w-full group outline-none"
                 >
                   <Card className="p-6 md:p-8 flex items-center gap-6 border-border-subtle hover:border-accent-green transition-all group-hover:scale-[1.02] active:scale-[0.98]">
                      <div className="w-16 h-16 rounded-2xl bg-accent-green/10 flex items-center justify-center text-accent-green group-hover:bg-accent-green group-hover:text-black transition-colors">
                         <Users size={32} />
                      </div>
                      <div className="text-left space-y-1">
                         <h4 className="font-display font-black uppercase tracking-tight text-xl leading-none">Joueur / Organisateur</h4>
                         <p className="text-xs text-text-secondary leading-tight">Je veux organiser des matchs et rejoindre des parties.</p>
                      </div>
                      <ChevronRight className="ml-auto text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                   </Card>
                 </button>

                 <button 
                  onClick={() => handleRoleSelect('MANAGER')}
                  className="w-full group outline-none"
                 >
                   <Card className="p-6 md:p-8 flex items-center gap-6 border-border-subtle hover:border-accent-green transition-all group-hover:scale-[1.02] active:scale-[0.98]">
                      <div className="w-16 h-16 rounded-2xl bg-background-secondary border border-border-subtle flex items-center justify-center text-text-tertiary group-hover:bg-accent-green group-hover:text-black transition-colors">
                         <Building2 size={32} />
                      </div>
                      <div className="text-left space-y-1">
                         <h4 className="font-display font-black uppercase tracking-tight text-xl leading-none">Gérant de complexe</h4>
                         <p className="text-xs text-text-secondary leading-tight">Je gère un ou plusieurs terrains de football.</p>
                      </div>
                      <ChevronRight className="ml-auto text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                   </Card>
                 </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'SETUP' && (
            <motion.div 
              key="setup"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-8"
            >
              <div className="text-center md:text-left space-y-1">
                <h2 className="text-3xl font-display font-black uppercase tracking-tight text-accent-green">Dernière étape</h2>
                <p className="text-text-secondary text-sm font-medium">Complète ton profil pour rejoindre le terrain.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Ton prénom</label>
                   <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent-green transition-colors">
                         <Smartphone size={18} />
                      </div>
                      <input 
                        type="text"
                        required
                        className="w-full bg-background-secondary border border-border-subtle focus:border-accent-green focus:outline-none rounded-xl pl-12 pr-4 h-14 font-sans text-sm transition-all"
                        placeholder="Ahmed, Skander..."
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Ta ville</label>
                   <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent-green transition-colors pointer-events-none">
                         <MapPin size={18} />
                      </div>
                      <select 
                        className="w-full bg-background-secondary border border-border-subtle focus:border-accent-green focus:outline-none rounded-xl pl-12 pr-4 h-14 font-sans text-sm appearance-none transition-all"
                      >
                         <option value="">Sélectionne ta ville</option>
                         {GOVERNORATES.map(gov => (
                           <option key={gov} value={gov}>{gov}</option>
                         ))}
                      </select>
                   </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                 <Button 
                   onClick={() => navigate('/profil')}
                   className="w-full h-16 font-black uppercase tracking-widest"
                 >
                   Terminer <ChevronRight size={18} />
                 </Button>
                 <button 
                  onClick={() => navigate('/profil')}
                  className="w-full text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-white"
                 >
                   Plus tard
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
