import * as React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Loader2, 
  ChevronRight, 
  ArrowLeft, 
  Users, 
  Building2, 
  MapPin, 
  Smartphone,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { useToast } from '@/src/components/ui/Toast';
import { UserRole } from '@/src/lib/schema';
import { cn } from '@/src/lib/utils';
import OnboardingFlow, { OnboardingData } from '@/src/components/auth/OnboardingFlow';

type Step = 'PHONE' | 'OTP' | 'ONBOARDING' | 'ADMIN';

const TUNISIAN_GOVERNORATES = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Bizerte", "Nabeul", "Zaghouan", "Béja", 
  "Jendouba", "Le Kef", "Siliana", "Sousse", "Monastir", "Mahdia", "Sfax", "Kairouan", 
  "Kasserine", "Sidi Bouzid", "Gabès", "Médenine", "Tataouine", "Gafsa", "Tozeur", "Kebili"
];

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = React.useState<Step>('PHONE');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [otp, setOtp] = React.useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [confirmationResult, setConfirmationResult] = React.useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = React.useState<RecaptchaVerifier | null>(null);
  const [shake, setShake] = React.useState(false);
  
  // Admin Login State
  const [adminEmail, setAdminEmail] = React.useState('');
  const [adminPassword, setAdminPassword] = React.useState('');
  const [showAdminPassword, setShowAdminPassword] = React.useState(false);

  const otpRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const from = location.state?.from?.pathname || "/";

  React.useEffect(() => {
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });
    setRecaptchaVerifier(verifier);

    return () => {
      verifier.clear();
    };
  }, []);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 8 || !recaptchaVerifier) return;
    
    setIsLoading(true);
    try {
      const formattedPhone = `+216${phoneNumber}`;
      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      setConfirmationResult(result);
      setCurrentStep('OTP');
      toast.success("Code envoyé !");
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/invalid-phone-number') {
        toast("Numéro de téléphone invalide", 'error');
      } else if (error.code === 'auth/too-many-requests') {
        toast("Trop de tentatives. Réessayez plus tard.", 'error');
      } else {
        toast("Une erreur est survenue", 'error');
      }
    } finally {
      setIsLoading(false);
    }
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
      handleOtpConfirm(newOtp.join(''));
    }
  };

  const handleOtpConfirm = async (code: string) => {
    if (!confirmationResult) return;
    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(code);
      const firebaseUser = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        await refreshProfile();
        toast(`Ravi de vous revoir, ${userData.firstName || userData.name} !`, 'success');
        
        if (userData.role === 'admin') {
          navigate('/admin');
        } else if (userData.role === 'manager') {
          navigate('/dashboard');
        } else {
          // Redirect to originally requested page or home
          navigate(from);
        }
      } else {
        setCurrentStep('ONBOARDING');
      }
    } catch (error: any) {
      if (error.code === 'auth/invalid-verification-code') {
        setShake(true);
        setOtpError("Code incorrect. Réessaye.");
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
        setTimeout(() => setShake(false), 400);
      } else if (error.code === 'auth/code-expired') {
        toast("Le code a expiré. Demande un nouveau code.", 'error');
        setCurrentStep('PHONE');
        setOtp(['', '', '', '', '', '']);
      } else {
        toast("Une erreur est survenue", 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async (onboardingData: OnboardingData) => {
    if (!auth.currentUser) return;
    
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      const userData = {
        id: user.uid,
        phone: user.phoneNumber || '',
        name: `${onboardingData.firstName} ${onboardingData.lastName}`,
        firstName: onboardingData.firstName,
        lastName: onboardingData.lastName,
        role: onboardingData.role,
        city: onboardingData.city,
        avatarColor: onboardingData.avatarColor,
        jerseyColor: onboardingData.jerseyColor,
        jerseyName: onboardingData.jerseyName,
        jerseyNumber: onboardingData.jerseyNumber,
        isActive: true,
        createdAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      await refreshProfile();
      
      toast(`Bienvenue sur Takwira, ${onboardingData.firstName} ! 🎉`, 'success');
      
      if (onboardingData.role === 'manager') {
        navigate('/inscription-gerant');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast("Erreur lors de la création du profil", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists() || userDoc.data()?.role !== 'admin') {
        await signOut(auth);
        toast("Accès non autorisé.", 'error');
        return;
      }
      
      await refreshProfile();
      toast("Connexion administrateur réussie", 'success');
      navigate('/admin');
    } catch (error: any) {
      toast("Identifiants incorrects", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow bg-background-primary flex items-center justify-center relative overflow-hidden px-4 pb-12">
      <div id="recaptcha-container"></div>
      
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
          <Link to="/" className="flex items-center group" aria-label="Takwira.com Home">
            <span className="text-3xl font-display font-black tracking-tighter text-pl-purple">TAKWIRA</span>
            <span className="text-3xl font-display font-black tracking-tighter text-pl-pink">.</span>
          </Link>
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
                <h2 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight leading-none">Connexion</h2>
                <p className="text-text-secondary text-sm font-medium">Saisis ton numéro pour jouer ou gérer tes terrains.</p>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div className="space-y-2">
                   <div className="relative group">
                      <div className="absolute left-0 top-0 bottom-0 w-16 bg-background-secondary border-r border-border-subtle rounded-l-xl flex items-center justify-center font-bold text-text-secondary group-focus-within:text-accent-green transition-all">
                         +216
                      </div>
                      <input 
                        required
                        type="tel"
                        maxLength={8}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-background-secondary border border-border-subtle focus:border-accent-green focus:outline-none rounded-xl pl-20 pr-4 h-16 font-sans text-xl tracking-[0.2em] font-bold transition-all"
                        placeholder="00000000"
                        autoFocus
                      />
                   </div>
                   <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest px-1">
                     Un code de vérification sera envoyé par SMS
                   </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || phoneNumber.length !== 8}
                  className="w-full h-16 text-lg font-black uppercase tracking-widest"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Continuer"}
                </Button>
              </form>

              <div className="text-center">
                <button 
                  onClick={() => setCurrentStep('ADMIN')}
                  className="text-[11px] font-medium uppercase tracking-widest text-text-tertiary hover:text-accent-green transition-colors mt-4"
                >
                  Accès administrateur →
                </button>
              </div>
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
                  onClick={() => {
                    setCurrentStep('PHONE');
                    setOtp(['', '', '', '', '', '']);
                    setOtpError(null);
                  }}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-accent-green transition-colors mb-4"
                >
                  <ArrowLeft size={14} /> Modifier le numéro
                </button>
                <h2 className="text-3xl font-display font-black uppercase tracking-tight">Code SMS</h2>
                <p className="text-text-secondary text-sm font-medium">
                  Saisis le code envoyé au <span className="text-pl-purple font-bold">+216 {phoneNumber}</span>
                </p>
              </div>

              <div className="space-y-4">
                <div className={cn("flex justify-between gap-2 md:gap-4", shake && "animate-shake")}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        setOtpError(null);
                        handleOtpChange(i, e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && i > 0) {
                          otpRefs.current[i - 1]?.focus();
                        }
                      }}
                      className={cn(
                        "w-full h-14 md:h-16 bg-background-secondary border focus:outline-none rounded-xl text-center text-2xl font-display font-black transition-all",
                        otpError ? "border-danger focus:border-danger" : "border-border-subtle focus:border-accent-green focus:shadow-[0_0_15px_rgba(0,255,135,0.2)]"
                      )}
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="text-danger text-xs font-bold text-center animate-fade-in">{otpError}</p>
                )}
              </div>

              <div className="text-center pt-4">
                <button 
                  onClick={() => setConfirmationResult(null)} // This would trigger a resend if implemented
                  className="text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-accent-green transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  Je n'ai pas reçu le code
                </button>
              </div>

              <Button 
                onClick={() => handleOtpConfirm(otp.join(''))}
                disabled={isLoading || otp.some(d => d === '')}
                className="w-full h-16 font-black uppercase tracking-widest"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Vérifier le code"}
              </Button>
            </motion.div>
          )}

          {currentStep === 'ONBOARDING' && (
            <OnboardingFlow 
              onComplete={handleOnboardingComplete}
              onCancel={() => setCurrentStep('PHONE')}
            />
          )}

          {currentStep === 'ADMIN' && (
            <motion.div 
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <button 
                  onClick={() => setCurrentStep('PHONE')}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-accent-green transition-colors mb-4"
                >
                  <ArrowLeft size={14} /> Retour
                </button>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-accent-green/10 flex items-center justify-center text-accent-green">
                      <ShieldCheck size={24} />
                   </div>
                   <h2 className="text-3xl font-display font-black uppercase tracking-tight">Admin</h2>
                </div>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Email</label>
                      <input 
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full bg-background-secondary border border-border-subtle focus:border-accent-green focus:outline-none rounded-xl px-4 h-14 font-sans text-sm transition-all text-white"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Mot de passe</label>
                      <div className="relative group">
                         <input 
                           type={showAdminPassword ? "text" : "password"}
                           required
                           value={adminPassword}
                           onChange={(e) => setAdminPassword(e.target.value)}
                           className="w-full bg-background-secondary border border-border-subtle focus:border-accent-green focus:outline-none rounded-xl px-4 h-14 font-sans text-sm transition-all text-white"
                         />
                         <button 
                           type="button"
                           onClick={() => setShowAdminPassword(!showAdminPassword)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-white transition-colors"
                         >
                           {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                         </button>
                      </div>
                   </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-16 font-black uppercase tracking-widest bg-white text-black hover:bg-accent-green transition-colors"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Se connecter"}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}} />
    </div>
  );
}
