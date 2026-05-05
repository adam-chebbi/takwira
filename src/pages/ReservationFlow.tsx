import * as React from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Check, 
  User, 
  Phone, 
  Lock, 
  Share2, 
  Copy, 
  MessageCircle, 
  ArrowRight,
  Info,
  Calendar,
  Clock,
  Euro,
  MapPin,
  Trophy,
  Loader2
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { trackReservationSubmitted } from '@/src/lib/googleAds';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTerrain } from '@/src/hooks/useTerrain';
import { useToast } from '@/src/components/ui/Toast';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// --- Helpers ---
const generateToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

// --- Types ---
type Step = 1 | 2 | 3 | 'success';

interface ReservationData {
  matchName: string;
  isPublic: boolean;
  fullName: string;
  phone: string;
  slotDate: string;
  slotTime: string;
  startTime: string;
  endTime: string;
}

const STEPS = [
  { id: 1, label: "Créneau" },
  { id: 2, label: "Vos Infos" },
  { id: 3, label: "Confirmation" }
];

// --- Components ---

const ProgressIndicator = ({ currentStep }: { currentStep: number }) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-12">
      {STEPS.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border-2",
              currentStep > step.id ? "bg-accent-green border-accent-green text-black" : 
              currentStep === step.id ? "bg-background-primary border-accent-green text-accent-green shadow-[0_0_15px_rgba(0,255,135,0.3)]" : 
              "bg-background-secondary border-border-subtle text-text-secondary"
            )}>
              {currentStep > step.id ? <Check size={18} strokeWidth={3} /> : step.id}
            </div>
            <span className={cn(
              "text-[10px] uppercase font-bold tracking-widest whitespace-nowrap",
              currentStep === step.id ? "text-accent-green" : "text-text-secondary"
            )}>
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div className="w-16 h-[2px] bg-background-secondary mb-6 relative">
              <motion.div 
                className="absolute inset-0 bg-accent-green shadow-[0_0_10px_rgba(0,255,135,0.3)]"
                initial={{ width: "0%" }}
                animate={{ width: currentStep > step.id ? "100%" : "0%" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const TypewriterPlaceholder = () => {
  const [text, setText] = React.useState('');
  const suggestions = ["Match du mercredi", "Takwira FC", "Derby de Tunis", "Challenge Inter-Entreprises"];
  const [suggestionIndex, setSuggestionIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const currentFullText = suggestions[suggestionIndex];
    const delay = isDeleting ? 50 : 150;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(currentFullText.substring(0, text.length + 1));
        if (text.length === currentFullText.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setText(currentFullText.substring(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setSuggestionIndex((prev) => (prev + 1) % suggestions.length);
        }
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, suggestionIndex]);

  return (
    <span className="text-text-tertiary/50">
      Ex: {text}<span className="animate-pulse">|</span>
    </span>
  );
};

export default function ReservationFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user, userProfile } = useAuth();
  const { terrain, complex, isLoading: isTerrainLoading } = useTerrain(id);
  
  const [step, setStep] = React.useState<Step>(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<ReservationData>({
    matchName: '',
    isPublic: true,
    fullName: '',
    phone: '',
    slotDate: (location.state as any)?.selectedDate || '',
    slotTime: `${(location.state as any)?.selectedStartTime} - ${(location.state as any)?.selectedEndTime}`,
    startTime: (location.state as any)?.selectedStartTime || '',
    endTime: (location.state as any)?.selectedEndTime || ''
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || userProfile.name || '',
        phone: prev.phone || userProfile.phone?.replace('+216', '') || ''
      }));
    }
  }, [userProfile]);

  const handleNext = () => {
    if (step === 2) {
      const newErrors: Record<string, string> = {};
      if (!formData.fullName) newErrors.fullName = "Le nom complet est requis";
      if (!formData.phone || formData.phone.length !== 8) newErrors.phone = "Un numéro valide est requis (8 chiffres)";
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
    }
    
    if (typeof step === 'number' && step < 3) {
      setStep((prev) => (prev as number) + 1 as Step);
    } else {
      confirmReservation();
    }
  };

  const confirmReservation = async () => {
    if (!user || !terrain || !complex) return;
    
    setIsLoading(true);
    try {
      // 1. Create Reservation
      const reservationData = {
        terrainId: terrain.id,
        complexId: complex.id,
        managerId: terrain.managerId,
        organizerId: user.uid,
        organizerName: formData.fullName,
        organizerPhone: `+216${formData.phone}`,
        matchTitle: formData.matchName || `Match du ${formData.slotDate}`,
        date: formData.slotDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: 'pending',
        isRecurring: false,
        createdAt: serverTimestamp()
      };

      const resRef = await addDoc(collection(db, 'reservations'), reservationData);

      // 2. Create Match
      const linkToken = generateToken();
      const matchData = {
        reservationId: resRef.id,
        terrainId: terrain.id,
        complexId: complex.id,
        terrainName: terrain.name,
        complexName: complex.name,
        organizerId: user.uid,
        organizerName: formData.fullName,
        title: formData.matchName || `Match du ${formData.slotDate}`,
        date: formData.slotDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        format: terrain.type,
        maxPlayers: terrain.maxPlayers || (terrain.type === '6v6' ? 12 : 14),
        linkToken,
        teamA: [],
        teamB: [],
        teamsPublished: false,
        status: 'open',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'matches'), matchData);

      // 3. Create Notification for Manager
      await addDoc(collection(db, 'notifications'), {
        userId: terrain.managerId,
        type: 'new_reservation',
        title: "Nouvelle réservation",
        body: `${formData.fullName} a réservé ${terrain.name} le ${formData.slotDate} à ${formData.startTime}`,
        relatedId: resRef.id,
        isRead: false,
        createdAt: serverTimestamp()
      });

      trackReservationSubmitted();
      navigate(`/match/${linkToken}`, { state: { justCreated: true } });
    } catch (error: any) {
      console.error("Reservation error:", error);
      toast("Une erreur est survenue lors de la réservation", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (typeof step === 'number' && step > 1) {
      setStep((prev) => (prev as number) - 1 as Step);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex-grow pt-24 pb-20 bg-background-primary overflow-x-hidden">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-text-secondary hover:text-accent-green transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">Retour</span>
          </button>
          <div className="text-right">
            <h1 className="text-xl font-display font-bold uppercase tracking-tight">Réserver</h1>
            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-sans font-bold">Tunnel de réservation</p>
          </div>
        </div>

        <ProgressIndicator currentStep={step as number} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step as number}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {step === 1 && (
              <div className="space-y-8">
                {isTerrainLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-accent-green" size={40} />
                    <p className="text-xs font-bold uppercase tracking-widest text-text-tertiary">Chargement du terrain...</p>
                  </div>
                ) : !formData.slotDate ? (
                  <div className="text-center py-20 space-y-6 bg-background-card rounded-3xl border-2 border-dashed border-border-subtle">
                    <div className="w-16 h-16 bg-background-secondary rounded-2xl flex items-center justify-center mx-auto text-text-tertiary">
                      <Calendar size={32} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-display font-bold uppercase">Aucun créneau sélectionné</h3>
                      <p className="text-sm text-text-secondary max-w-xs mx-auto">Veuillez retourner sur la page du terrain pour choisir une heure disponible.</p>
                    </div>
                    <Button onClick={() => navigate(`/terrains/${id}`)} variant="outline" className="font-bold uppercase tracking-widest">
                      Voir les disponibilités →
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Recap Card */}
                    <Card className="p-6 bg-background-card border-accent-green/20 relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-green" />
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-2xl font-display font-extrabold uppercase leading-none mb-1">{complex?.name || "Chargement..."}</h3>
                          <div className="flex items-center gap-2 text-text-secondary">
                            <span className="text-xs font-bold uppercase tracking-wider">{terrain?.name}</span>
                            <span className="text-[10px]">•</span>
                            <Badge variant="outline" className="text-[10px] py-0 px-2">{terrain?.type}</Badge>
                          </div>
                        </div>
                        <Link to={`/terrains/${id}`} className="text-accent-green text-[10px] font-bold uppercase tracking-widest hover:underline">
                          Modifier
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-background-secondary flex items-center justify-center text-accent-green">
                            <Calendar size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] text-text-secondary uppercase font-bold font-sans">Date</p>
                            <p className="text-sm font-bold">{formData.slotDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-background-secondary flex items-center justify-center text-accent-green">
                            <Clock size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] text-text-secondary uppercase font-bold font-sans">Horaire</p>
                            <p className="text-sm font-bold">{formData.startTime} → {formData.endTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-background-secondary flex items-center justify-center text-accent-green">
                            <Trophy size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] text-text-secondary uppercase font-bold font-sans">Durée</p>
                            <p className="text-sm font-bold">1 heure</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-background-secondary flex items-center justify-center text-accent-green">
                            <Euro size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] text-text-secondary uppercase font-bold font-sans">Prix</p>
                            <p className="text-sm font-bold text-accent-green">{terrain?.pricePerHour} DT</p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Match Name */}
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-widest text-text-secondary block">Nom du match (optionnel)</label>
                      <div className="relative group">
                        <input 
                          type="text"
                          value={formData.matchName}
                          onChange={(e) => setFormData({...formData, matchName: e.target.value})}
                          placeholder=" "
                          className="w-full bg-background-secondary border border-border-subtle hover:border-accent-green/50 focus:border-accent-green focus:outline-none transition-all rounded-xl p-4 font-sans text-sm h-14"
                        />
                        {formData.matchName === '' && (
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-sm font-sans">
                            <TypewriterPlaceholder />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Public Toggle */}
                    <div className="p-6 bg-background-card rounded-2xl border border-border-subtle flex items-start justify-between gap-6 group hover:border-accent-green/30 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Share2 size={16} className="text-accent-green" />
                          <h4 className="font-bold text-sm uppercase tracking-wider">Match Public</h4>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Rendre ce match visible aux joueurs qui cherchent un match sur la plateforme.
                        </p>
                      </div>
                      <button 
                        onClick={() => setFormData({...formData, isPublic: !formData.isPublic})}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-colors duration-300 shrink-0 mt-1",
                          formData.isPublic ? "bg-accent-green" : "bg-background-secondary border border-border-subtle"
                        )}
                      >
                        <motion.div 
                          className={cn(
                            "absolute top-1 w-4 h-4 rounded-full shadow-md",
                            formData.isPublic ? "bg-black" : "bg-text-tertiary"
                          )}
                          animate={{ left: formData.isPublic ? "calc(100% - 20px)" : "4px" }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>

                    <Button 
                      onClick={handleNext}
                      className="w-full h-14 text-sm font-extrabold uppercase tracking-widest shadow-[0_10px_30px_rgba(34,197,94,0.2)]"
                    >
                      Continuer <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <h2 className="text-3xl font-display uppercase font-extrabold tracking-tight">Vos Informations</h2>
                
                <div className="space-y-6">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Nom et Prénom</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent-green transition-colors">
                        <User size={18} />
                      </div>
                      <input 
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className={cn(
                          "w-full bg-background-secondary border hover:border-accent-green/50 focus:border-accent-green focus:outline-none transition-all rounded-xl pl-12 pr-4 font-sans text-sm h-14",
                          errors.fullName ? "border-danger shadow-[0_0_10px_rgba(255,59,92,0.1)]" : "border-border-subtle"
                        )}
                        placeholder="John Doe"
                      />
                    </div>
                    <AnimatePresence>
                      {errors.fullName && (
                        <motion.p 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="text-[10px] text-danger font-bold uppercase tracking-widest mt-1 pl-1"
                        >
                          {errors.fullName}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Numéro de Téléphone</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary font-sans font-bold text-sm">
                        +216
                      </div>
                      <input 
                        type="tel"
                        maxLength={8}
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                        className={cn(
                          "w-full bg-background-secondary border hover:border-accent-green/50 focus:border-accent-green focus:outline-none transition-all rounded-xl pl-16 pr-12 font-sans text-sm h-14 font-extrabold tracking-widest",
                          errors.phone ? "border-danger shadow-[0_0_10px_rgba(255,59,92,0.1)]" : "border-border-subtle"
                        )}
                        placeholder="00 000 000"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">
                        <Lock size={16} />
                      </div>
                    </div>
                    <AnimatePresence>
                      {errors.phone && (
                        <motion.p 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="text-[10px] text-danger font-bold uppercase tracking-widest mt-1 pl-1"
                        >
                          {errors.phone}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Privacy Box */}
                  <div className="flex gap-4 p-4 bg-background-card rounded-2xl border-l-2 border-accent-green group shadow-xl">
                    <div className="shrink-0 text-accent-green mt-0.5">
                      <Lock size={18} />
                    </div>
                    <p className="text-[10px] text-text-secondary leading-relaxed font-sans font-medium">
                      🔒 <span className="font-bold text-text-primary">Votre numéro est confidentiel.</span> Il sera visible uniquement par le gérant du terrain pour confirmer votre réservation. Il ne sera jamais partagé avec d'autres utilisateurs.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-4 px-1">
                    <div className="w-1.5 h-1.5 bg-accent-green rounded-full shadow-[0_0_5px_rgba(0,255,135,0.8)]" />
                    <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-widest">Connecté en tant que {userProfile?.name || user?.email}</span>
                    <Link to="/profil" className="text-[10px] uppercase font-bold text-accent-green tracking-widest hover:underline ml-auto">
                      Modifier sur mon profil
                    </Link>
                  </div>
                </div>

                <Button 
                  onClick={handleNext}
                  className="w-full h-14 text-sm font-extrabold uppercase tracking-widest shadow-[0_10px_30px_rgba(34,197,94,0.2)]"
                >
                  Continuer <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <h2 className="text-3xl font-display uppercase font-extrabold tracking-tight">Vérification</h2>
                
                {/* Ticket Component */}
                <div className="relative">
                  <motion.div 
                    initial={{ rotateX: 20, y: 20, opacity: 0 }}
                    animate={{ rotateX: 0, y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="reservation-ticket w-full bg-[#11111E] rounded-3xl overflow-hidden shadow-2xl relative border border-white/5"
                  >
                    {/* Dark Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                         style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }} />
                    
                    {/* Ticket Header */}
                    <div className="p-6 pb-2 relative flex justify-between items-center bg-accent-green/5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-accent-green rounded flex items-center justify-center">
                          <Check size={14} className="text-black" strokeWidth={4} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Takwira.com</span>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-accent-green">Billet de réservation</span>
                    </div>

                    <div className="p-8 space-y-6 relative">
                      <div className="space-y-1">
                        <h3 className="text-[10px] uppercase font-bold text-accent-green tracking-[0.2em] mb-2">{complex?.name}</h3>
                        <div className="flex justify-between items-end gap-4 overflow-hidden">
                          <h4 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter truncate leading-none">
                            {terrain?.name}
                          </h4>
                          <Badge variant="primary" className="bg-white/10 text-white border-white/10 mb-1">{terrain?.type}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8 pt-4">
                        <div className="space-y-1">
                          <p className="text-[8px] uppercase font-bold text-text-tertiary tracking-widest">Date</p>
                          <p className="text-lg font-display font-black uppercase whitespace-nowrap">{formData.slotDate}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] uppercase font-bold text-text-tertiary tracking-widest">Heure</p>
                          <p className="text-lg font-display font-black uppercase whitespace-nowrap">{formData.startTime} - {formData.endTime}</p>
                        </div>
                      </div>

                      {/* Perforated Separator */}
                      <div className="relative py-4 -mx-10 flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-background-primary -ml-3 z-20 border-r border-white/5" />
                        <div className="flex-1 border-t-2 border-dashed border-white/10" />
                        <div className="w-6 h-6 rounded-full bg-background-primary -mr-3 z-20 border-l border-white/5" />
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-[8px] uppercase font-bold text-text-tertiary tracking-widest">Organisateur</p>
                          <p className="text-sm font-bold uppercase tracking-widest">{formData.fullName}</p>
                          <p className="text-[10px] font-sans text-text-secondary tracking-widest">PHONE: +216 **** {formData.phone.slice(-4)}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] uppercase font-bold text-text-tertiary tracking-widest block mb-1">Status</span>
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 font-black animate-pulse">
                            EN ATTENTE
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="p-6 bg-accent-green flex justify-between items-center text-black">
                      <div className="flex items-center gap-2">
                        <Euro size={18} />
                        <span className="text-2xl font-display font-black">{terrain?.pricePerHour} DT</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Paiement sur place</span>
                    </div>
                  </motion.div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-accent-green rounded-full blur-2xl opacity-20" />
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-accent-green rounded-full blur-2xl opacity-20" />
                </div>

                <div className="p-4 bg-background-secondary rounded-2xl flex gap-3 border border-border-subtle mt-4">
                  <Info size={18} className="text-accent-green shrink-0 mt-0.5" />
                  <p className="text-xs text-text-secondary leading-relaxed font-sans font-medium italic">
                    Le gérant va recevoir votre demande et vous contactera pour confirmer. Vous recevrez une notification dès que votre réservation est confirmée.
                  </p>
                </div>

                <Button 
                  onClick={handleNext}
                  disabled={isLoading}
                  className={cn(
                    "w-full h-16 text-md font-extrabold uppercase tracking-widest transition-all",
                    isLoading ? "bg-accent-green/50 pointer-events-none" : "shadow-[0_10px_30px_rgba(34,197,94,0.3)] hover:scale-[1.01]"
                  )}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      <span>Envoi en cours...</span>
                    </div>
                  ) : (
                    "Confirmer la Réservation"
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        .reservation-ticket {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}

// --- Helpers and Types moved to top ---
