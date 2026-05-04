import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Building2, 
  ChevronLeft, 
  ArrowRight,
  MoveRight,
  Plus,
  Minus,
  Info,
  Loader2
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { cn } from '@/src/lib/utils';

export type UserRole = 'player' | 'manager';

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onCancel: () => void;
}

export interface OnboardingData {
  role: UserRole;
  firstName: string;
  lastName: string;
  city: string;
  avatarColor: string;
  jerseyColor: 'red' | 'blue';
  jerseyName: string;
  jerseyNumber: number;
}

const GOVERNORATES = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Bizerte", "Nabeul", "Zaghouan", "Béja", 
  "Jendouba", "Le Kef", "Siliana", "Sousse", "Monastir", "Mahdia", "Sfax", "Kairouan", 
  "Kasserine", "Sidi Bouzid", "Gabès", "Médenine", "Tataouine", "Gafsa", "Tozeur", "Kebili"
];

const AVATAR_COLORS = [
  "#FF6B00", // Vibrant Orange
  "#00D1FF", // Sky Blue
  "#FF4B4B", // Coral Red
  "#32CD32", // Lime Green
  "#9D00FF", // Purple
  "#00BFA5", // Teal
  "#FFD700", // Gold Yellow
  "#FF007A", // Hot Pink
];

export default function OnboardingFlow({ onComplete, onCancel }: OnboardingFlowProps) {
  const [step, setStep] = React.useState(1);
  const [direction, setDirection] = React.useState(0);
  const [isCompleting, setIsCompleting] = React.useState(false);
  const [data, setData] = React.useState<OnboardingData>({
    role: 'player',
    firstName: '',
    lastName: '',
    city: '',
    avatarColor: AVATAR_COLORS[0],
    jerseyColor: 'red',
    jerseyName: '',
    jerseyNumber: 10,
  });

  // Pre-fill jersey name when lastName changes
  React.useEffect(() => {
    if (data.lastName && !data.jerseyName) {
      setData(d => ({ ...d, jerseyName: d.lastName.substring(0, 12).toUpperCase() }));
    }
  }, [data.lastName]);

  const nextStep = () => {
    setDirection(1);
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep(s => s - 1);
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    // Simulate short loading for dramatic effect as requested
    await new Promise(resolve => setTimeout(resolve, 800));
    onComplete(data);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const spring = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0F] overflow-hidden flex flex-col font-sans">
      {/* Background Pulse Gradient */}
      <div className="absolute inset-x-0 top-0 h-screen overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.07, 0.03],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pl-green rounded-full blur-[160px]"
        />
      </div>

      {/* Header with Step Indicator */}
      <div className="relative z-10 w-full pt-6 md:pt-10 pb-4 flex flex-col items-center">
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center">
              {step === i ? (
                <motion.div 
                  layoutId="activeTab"
                  className="w-8 h-2.5 bg-pl-green rounded-full" 
                />
              ) : i < step ? (
                <div className="w-2.5 h-2.5 bg-pl-green rounded-full shadow-[0_0_10px_rgba(0,255,133,0.3)]" />
              ) : (
                <div className="w-2.5 h-2.5 border-2 border-border-subtle rounded-full" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={spring}
            className={cn(
              "w-full h-full flex flex-col items-center justify-center p-6",
              step === 4 ? "max-w-7xl" : "max-w-4xl"
            )}
          >
            {step === 1 && (
              <Step1 
                onSelect={(role) => {
                  setData(d => ({ ...d, role }));
                  setTimeout(nextStep, 300);
                }} 
              />
            )}
            {step === 2 && (
              <Step2 
                data={data}
                onUpdate={(fields) => setData(d => ({ ...d, ...fields }))}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {step === 3 && (
              <Step3 
                data={data}
                onUpdate={(avatarColor) => setData(d => ({ ...d, avatarColor }))}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {step === 4 && (
              <Step4 
                data={data}
                onUpdate={(fields) => setData(d => ({ ...d, ...fields }))}
                onComplete={handleComplete}
                isLoading={isCompleting}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer for steps that are not Step 1 or Step 4 */}
      {step > 1 && step < 4 && (
        <div className="relative z-10 p-8 flex justify-center">
          <button 
            onClick={prevStep}
            className="flex items-center gap-2 text-text-muted hover:text-white transition-colors uppercase text-xs font-bold tracking-widest"
          >
            <ChevronLeft size={16} /> Retour
          </button>
        </div>
      )}
    </div>
  );
}

function Step1({ onSelect }: { onSelect: (role: UserRole) => void }) {
  const [selected, setSelected] = React.useState<UserRole | null>(null);

  const handleSelect = (role: UserRole) => {
    setSelected(role);
    onSelect(role);
  };

  return (
    <div className="text-center w-full max-w-3xl">
      <motion.div
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-7xl mb-8 flex justify-center"
      >
        <div className="relative">
          ⚽
        </div>
      </motion.div>

      <h1 className="text-[clamp(40px,8vw,80px)] font-display font-extrabold uppercase leading-[0.85] tracking-tight text-white mb-4">
        Bienvenue sur <span className="text-pl-green">Takwira</span>
      </h1>
      <p className="text-text-secondary text-lg md:text-xl font-medium mb-12 max-w-xl mx-auto px-4">
        Dis-nous qui tu es pour personnaliser ton expérience
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4">
        <RoleCard 
          role="player"
          title="JOUEUR"
          description="Je joue et j'organise des matchs avec mes amis."
          icon={Users}
          selected={selected === 'player'}
          onClick={() => handleSelect('player')}
        />
        <RoleCard 
          role="manager"
          title="GÉRANT DE COMPLEXE"
          description="Je gère un ou plusieurs terrains de football."
          icon={Building2}
          selected={selected === 'manager'}
          onClick={() => handleSelect('manager')}
        />
      </div>
    </div>
  );
}

function RoleCard({ title, description, icon: Icon, selected, onClick, role }: any) {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "relative p-7 text-left cursor-pointer transition-all duration-300 border-2 bg-white/5",
        selected 
          ? "border-pl-green bg-pl-green/5 ring-4 ring-pl-green/10 scale-[1.02]" 
          : "border-white/10 hover:border-white/20"
      )}
    >
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors",
        selected ? "bg-pl-green text-black" : "bg-white/10 text-white"
      )}>
        <Icon size={28} />
      </div>
      <h3 className={cn(
        "text-2xl font-display font-extrabold uppercase tracking-tight mb-2",
        selected ? "text-pl-green" : "text-white"
      )}>
        {title}
      </h3>
      <p className="text-text-secondary text-sm leading-relaxed">
        {description}
      </p>
    </Card>
  );
}

function Step2({ data, onUpdate, onNext, onBack }: any) {
  const canContinue = data.firstName && data.lastName;

  return (
    <div className="w-full max-w-md text-center">
      <h1 className="text-5xl font-display font-extrabold uppercase tracking-tight text-white mb-10">
        Parle-nous de toi
      </h1>

      <div className="space-y-5 text-left mb-8">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-2">Prénom</label>
          <input 
            type="text"
            value={data.firstName}
            onChange={(e) => onUpdate({ firstName: e.target.value })}
            className="w-full h-16 bg-white/5 border border-white/10 rounded-[18px] px-6 text-white text-lg focus:outline-none focus:border-pl-green focus:ring-1 focus:ring-pl-green/50 transition-all placeholder:text-white/20"
            placeholder="Ex: Mohamed"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-2">Nom</label>
          <input 
            type="text"
            value={data.lastName}
            onChange={(e) => onUpdate({ lastName: e.target.value })}
            className="w-full h-16 bg-white/5 border border-white/10 rounded-[18px] px-6 text-white text-lg focus:outline-none focus:border-pl-green focus:ring-1 focus:ring-pl-green/50 transition-all placeholder:text-white/20"
            placeholder="Ex: Trabelsi"
          />
        </div>

        <div className="space-y-2 text-left">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-2">Ville (Gouvernorat)</label>
          <select 
            value={data.city}
            onChange={(e) => onUpdate({ city: e.target.value })}
            className="w-full h-16 bg-white/5 border border-white/10 rounded-[18px] px-6 text-white text-lg focus:outline-none focus:border-pl-green focus:ring-1 focus:ring-pl-green/50 transition-all appearance-none"
          >
            <option value="" className="bg-[#0A0A0F]">Sélectionne ta ville</option>
            {GOVERNORATES.map(gov => (
               <option key={gov} value={gov} className="bg-[#0A0A0F]">{gov}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-text-muted italic text-sm mb-10 px-4">
        {data.role === 'player' 
          ? "Tu es à quelques secondes de rejoindre des milliers de joueurs en Tunisie."
          : "Nous allons configurer ton complexe juste après."
        }
      </p>

      <Button 
        onClick={onNext}
        disabled={!canContinue}
        className="w-full h-16 bg-pl-green hover:bg-pl-green/90 text-black font-black uppercase tracking-widest text-lg"
      >
        Continuer <MoveRight className="ml-2" />
      </Button>
    </div>
  );
}

function Step3({ data, onUpdate, onNext }: any) {
  const initials = (data.firstName && data.lastName) 
    ? `${data.firstName[0]}${data.lastName[0]}`.toUpperCase()
    : 'TK';

  return (
    <div className="w-full max-w-xl text-center">
      <h1 className="text-5xl font-display font-extrabold uppercase tracking-tight text-white mb-4">
        Choisis ta couleur
      </h1>
      <p className="text-text-secondary mb-12">
        Elle représentera ton avatar dans les matchs et le chat.
      </p>

      {/* Avatar Preview */}
      <div className="mb-12 flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={data.avatarColor}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl font-display font-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/20"
            style={{ backgroundColor: data.avatarColor }}
          >
            {initials}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Color Circles */}
      <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar justify-center px-4">
        {AVATAR_COLORS.map(color => (
          <button
            key={color}
            onClick={() => onUpdate(color)}
            className="shrink-0"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{ 
                scale: data.avatarColor === color ? 1.2 : 1,
                borderWidth: data.avatarColor === color ? 4 : 0
              }}
              className="w-14 h-14 rounded-full border-white"
              style={{ backgroundColor: color }}
            />
          </button>
        ))}
      </div>

      <div className="mt-12 w-full max-w-xs mx-auto">
        <Button 
          onClick={onNext}
          className="w-full h-16 bg-pl-green hover:bg-pl-green/90 text-black font-black uppercase tracking-widest text-lg"
        >
          Continuer <MoveRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
}

function Step4({ data, onUpdate, onComplete, isLoading }: any) {
  const [isTyping, setIsTyping] = React.useState(false);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleTypingStart = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
  };

  const handleIncrement = () => {
    if (data.jerseyNumber < 99) {
      onUpdate({ jerseyNumber: data.jerseyNumber + 1 });
      handleTypingStart();
    }
  };

  const handleDecrement = () => {
    if (data.jerseyNumber > 1) {
      onUpdate({ jerseyNumber: data.jerseyNumber - 1 });
      handleTypingStart();
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 pt-4 pb-20 md:pb-0">
      {/* Jersey Preview - 55% Column */}
      <div className="w-full md:w-[55%] flex flex-col items-center justify-center relative">
        <div className="flex flex-col items-center mb-8">
           <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">Couleur du maillot</span>
           <div className="flex gap-4">
              <button 
                onClick={() => onUpdate({ jerseyColor: 'red' })}
                className={cn(
                  "flex items-center gap-3 px-5 py-2.5 rounded-xl border-2 transition-all",
                  data.jerseyColor === 'red' ? "border-pl-green bg-pl-green/10 text-pl-green" : "border-white/10 text-text-muted"
                )}
              >
                  <div className="w-4 h-4 rounded-full bg-red-600 shadow-md" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Rouge</span>
              </button>
              <button 
                onClick={() => onUpdate({ jerseyColor: 'blue' })}
                className={cn(
                  "flex items-center gap-3 px-5 py-2.5 rounded-xl border-2 transition-all",
                  data.jerseyColor === 'blue' ? "border-pl-green bg-pl-green/10 text-pl-green" : "border-white/10 text-text-muted"
                )}
              >
                  <div className="w-4 h-4 rounded-full bg-blue-600 shadow-md" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Bleu</span>
              </button>
           </div>
        </div>

        {/* Jersey Container with Perspective */}
        <div className="relative w-full max-w-[280px] md:max-w-[420px] aspect-[4/5]">
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
                  data.jerseyColor === 'red' ? "opacity-100 scale-100" : "opacity-0 scale-95"
                )}
              >
                <img 
                  src="/public/tshirt-red.png" 
                  alt="Jersey Red" 
                  className="w-full h-full object-contain filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                />
              </div>

              <div 
                className={cn(
                  "absolute inset-0 transition-all duration-500 ease-out",
                  data.jerseyColor === 'blue' ? "opacity-100 scale-100" : "opacity-0 scale-95"
                )}
              >
                <img 
                  src="/public/tshirt-blue.png" 
                  alt="Jersey Blue" 
                  className="w-full h-full object-contain filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                />
              </div>
            </div>

            {/* BACK OVERLAY (NAME & NUMBER) */}
            <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[70%] flex flex-col items-center pointer-events-none">
              <span className="text-[9px] md:text-[11px] font-display font-extrabold text-white/90 uppercase tracking-[0.25em] mb-1 drop-shadow-md">
                TAKWIRA<span className="text-pl-pink">.</span>
              </span>

              <motion.div
                key={data.jerseyNumber}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.15 }}
                className="text-[52px] md:text-[82px] font-display font-black text-white leading-none mb-1 md:mb-2"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
              >
                {data.jerseyNumber}
              </motion.div>

              <motion.div
                key={data.jerseyName}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.15 }}
                className="text-[14px] md:text-[20px] font-display font-bold text-white uppercase tracking-widest truncate w-full text-center"
                style={{ textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}
              >
                {data.jerseyName || "PLAYER"}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Controls - 45% Column */}
      <div className="w-full md:w-[45%] flex flex-col items-start text-left max-w-md">
        <div className="mb-8">
          <h2 className="text-4xl font-display font-black uppercase tracking-tight text-white mb-2 leading-none">
            CRÉE TON MAILLOT
          </h2>
          <p className="text-text-secondary text-sm font-medium">
            Ces infos apparaîtront sur ton maillot virtuel dans chaque match
          </p>
        </div>

        <div className="w-full space-y-8">
          {/* Name Input */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Ton nom sur le maillot</label>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                data.jerseyName.length >= 10 ? "text-pl-pink" : "text-text-muted"
              )}>
                {data.jerseyName.length}/12
              </span>
            </div>
            <input 
              type="text"
              maxLength={12}
              value={data.jerseyName}
              onChange={(e) => {
                onUpdate({ jerseyName: e.target.value.toUpperCase() });
                handleTypingStart();
              }}
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
              className="w-full h-16 bg-white/5 border border-white/10 rounded-[18px] px-6 text-white text-xl font-display font-black focus:outline-none focus:border-pl-green focus:ring-1 focus:ring-pl-green/50 transition-all placeholder:text-white/20 uppercase"
              placeholder="Nickname"
            />
          </div>

          {/* Number Input */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Ton numéro</label>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleDecrement}
                className="w-16 h-16 rounded-[18px] bg-white/5 border border-white/10 flex items-center justify-center text-white hover:border-pl-green hover:text-pl-green transition-all active:scale-95"
              >
                <Minus size={24} />
              </button>
              
              <div className="flex-1">
                <input 
                  type="number"
                  min="1"
                  max="99"
                  value={data.jerseyNumber}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1 && val <= 99) {
                      onUpdate({ jerseyNumber: val });
                      handleTypingStart();
                    }
                  }}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  className="w-full h-16 bg-white/5 border border-white/10 rounded-[18px] text-center text-3xl font-display font-black text-white focus:outline-none focus:border-pl-green transition-all"
                />
              </div>

              <button 
                onClick={handleIncrement}
                className="w-16 h-16 rounded-[18px] bg-white/5 border border-white/10 flex items-center justify-center text-white hover:border-pl-green hover:text-pl-green transition-all active:scale-95"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10">
             <Info size={18} className="text-pl-green shrink-0 mt-0.5" />
             <p className="text-text-muted italic text-xs leading-relaxed font-medium">
               Ton maillot sera affiché sur ton profil et dans les pages de match.
             </p>
          </div>
        </div>
      </div>

      {/* Completion Button - Fixed bottom on mobile, inline on desktop */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#0A0A0F]/80 backdrop-blur-xl border-t border-white/10 md:relative md:bg-transparent md:border-none md:p-0 w-full md:max-w-md z-30">
        <Button 
          onClick={onComplete}
          disabled={isLoading || !data.jerseyName}
          className="w-full h-16 bg-pl-green hover:bg-pl-green/90 text-black font-black uppercase tracking-widest text-lg group shadow-[0_0_30px_rgba(0,255,133,0.2)]"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <div className="flex items-center gap-3">
              Terminer et entrer sur le terrain <span className="group-hover:translate-x-1 transition-transform">⚽</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
