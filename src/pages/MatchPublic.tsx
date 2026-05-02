import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Users, 
  Calendar, 
  Clock, 
  Share2, 
  Copy, 
  MessageCircle, 
  User, 
  Phone, 
  Check, 
  Loader2,
  X,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { cn } from '@/src/lib/utils';

// --- Utility: Deterministic Color ---
const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-amber-500',
  'bg-rose-500',
];

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// --- Mock Data ---
interface Player {
  id: string;
  name: string;
  joinedAt: string;
}

const INITIAL_PLAYERS: Player[] = [
  { id: '1', name: 'Ahmed', joinedAt: '2026-05-01T10:00:00Z' },
  { id: '2', name: 'Sami', joinedAt: '2026-05-01T10:05:00Z' },
  { id: '3', name: 'Yassine', joinedAt: '2026-05-01T10:10:00Z' },
  { id: '4', name: 'Mehdi', joinedAt: '2026-05-01T10:15:00Z' },
  { id: '5', name: 'Karim', joinedAt: '2026-05-01T11:00:00Z' },
  { id: '6', name: 'Omar', joinedAt: '2026-05-01T11:05:00Z' },
  { id: '7', name: 'Skander', joinedAt: '2026-05-01T11:10:00Z' },
  { id: '8', name: 'Adel', joinedAt: '2026-05-01T11:15:00Z' },
];

const MOCK_MATCH = {
  title: "Match du Mercredi soir",
  terrainName: "Terrain 1 · Gammarth Foot Center",
  complexName: "Gammarth Foot Center",
  address: "Av. Habib Bourguiba, Gammarth 2070, Tunis",
  date: "2026-05-22T19:00:00Z",
  endDate: "2026-05-22T20:00:00Z",
  format: "6 vs 6",
  maxPlayers: 12,
  price: 20,
  organizer: {
    name: "Ahmed S.",
    whatsappEnabled: true
  },
  status: 'pending' as 'confirmed' | 'pending' | 'cancelled',
  teamsPublished: true,
  teams: {
    a: ['Ahmed', 'Sami', 'Yassine', 'Mehdi'],
    b: ['Karim', 'Omar', 'Skander', 'Adel']
  }
};

// --- Countdown component ---
const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = React.useState<string>('');

  React.useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Match commencé !');
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`Dans ${h}h${m.toString().padStart(2, '0')}m${s.toString().padStart(2, '0')}s`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-2xl md:text-3xl font-display font-extrabold text-accent-green tracking-tighter"
    >
      {timeLeft}
    </motion.div>
  );
};

export default function MatchPublic() {
  const { token } = useParams();
  const [players, setPlayers] = React.useState<Player[]>(INITIAL_PLAYERS);
  const [isCheckInOpen, setIsCheckInOpen] = React.useState(false);
  const [hasJoined, setHasJoined] = React.useState(false);
  const [userName, setUserName] = React.useState('');
  const [isJoining, setIsJoining] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const matchUrl = typeof window !== 'undefined' ? window.location.href : `takwira.com/match/${token}`;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    setIsJoining(true);
    setTimeout(() => {
      const newPlayer = {
        id: Math.random().toString(36).substr(2, 9),
        name: userName,
        joinedAt: new Date().toISOString()
      };
      setPlayers(prev => [...prev, newPlayer]);
      setHasJoined(true);
      setIsJoining(false);
      setIsCheckInOpen(false);
      // In a real app, toast would be shown here
    }, 1000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(matchUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background-primary pt-20 pb-32">
      {/* Hero Section */}
      <section className="bg-background-card border-b border-border-subtle py-8 md:py-12 overflow-hidden relative">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <nav className="mb-6 flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-text-secondary">
            <Link to="/" className="hover:text-accent-green transition-colors">Takwira.com</Link>
            <ChevronRight size={10} />
            <span className="text-text-tertiary">Match</span>
          </nav>

          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-7xl font-display font-black uppercase tracking-tighter leading-[0.9] text-text-primary">
                {MOCK_MATCH.title || "Match de Football"}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-text-secondary font-medium px-1">
                  <MapPin size={18} className="text-accent-green" />
                  <span className="text-sm md:text-base">{MOCK_MATCH.terrainName}</span>
                </div>
                
                <AnimatePresence mode="wait">
                  {MOCK_MATCH.status === 'confirmed' && (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-accent-green/10 text-accent-green border border-accent-green/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                       ✓ Terrain Confirmé
                    </motion.div>
                  )}
                  {MOCK_MATCH.status === 'pending' && (
                    <motion.div 
                      animate={{ opacity: [1, 0.5, 1] }} 
                      transition={{ duration: 2, repeat: Infinity }}
                      className="bg-warning/10 text-warning border border-warning/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                    >
                       ⏳ En attente de confirmation
                    </motion.div>
                  )}
                  {MOCK_MATCH.status === 'cancelled' && (
                    <motion.div className="bg-danger/10 text-danger border border-danger/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                       ✗ Annulé
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* PL Style Match Card */}
            <div className="bg-background-primary/50 border border-border-subtle rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden backdrop-blur-xl group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-accent-green/5 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-accent-green/10 transition-colors" />
               
               <div className="flex flex-col items-center md:items-start gap-1">
                  <span className="text-xl md:text-2xl font-display font-extrabold text-accent-green uppercase tracking-tighter">MERCREDI</span>
                  <span className="text-7xl md:text-9xl font-display font-black leading-none tracking-tighter">22</span>
                  <span className="text-xl md:text-2xl font-display font-extrabold uppercase tracking-tighter">MAI 2026</span>
               </div>

               <div className="h-px md:h-32 w-full md:w-px bg-border-subtle" />

               <div className="flex flex-col items-center md:items-end gap-1">
                  <span className="text-xl md:text-2xl font-display font-extrabold text-text-secondary uppercase tracking-tighter">COUP D'ENVOI</span>
                  <div className="flex items-center gap-4 text-4xl md:text-6xl font-display font-black tracking-tighter">
                    <span>19h00</span>
                    <span className="text-text-tertiary/30">—</span>
                    <span>20h00</span>
                  </div>
                  <CountdownTimer targetDate={MOCK_MATCH.date} />
               </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left/Main Column */}
        <div className="lg:col-span-2 space-y-16">
          
          {/* Players Section */}
          <section className="space-y-8">
            <div className="flex items-end justify-between border-b-2 border-border-subtle pb-4">
              <div className="space-y-1">
                <h2 className="text-2xl md:text-4xl font-display font-black uppercase tracking-tight">Joueurs Confirmés</h2>
                <p className="text-xs text-text-secondary font-medium uppercase tracking-widest">Ils ont déjà pris leur place</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-display font-black text-accent-green">{players.length}</span>
                <span className="text-xl font-display font-bold text-text-secondary"> / {MOCK_MATCH.maxPlayers}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-background-secondary rounded-full overflow-hidden border border-border-subtle">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(players.length / MOCK_MATCH.maxPlayers) * 100}%` }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="h-full bg-accent-green shadow-[0_0_15px_rgba(0,255,135,0.4)]"
              />
            </div>

            {/* Player Grid */}
            <div className="grid grid-cols-4 md:grid-cols-6 gap-y-10 gap-x-6">
              {players.map((player) => (
                <motion.div 
                  key={player.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className={cn(
                    "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-display font-bold text-lg md:text-xl border-4 border-background-primary shadow-xl",
                    getAvatarColor(player.name)
                  )}>
                    {getInitials(player.name)}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-center max-w-full truncate">{player.name}</span>
                </motion.div>
              ))}
              
              {/* Empty Spots */}
              {Array.from({ length: MOCK_MATCH.maxPlayers - players.length }).map((_, i) => (
                <div key={`empty-${i}`} className="flex flex-col items-center gap-3 animate-pulse">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-dashed border-border-subtle flex items-center justify-center text-text-tertiary">
                    <span className="font-display font-bold text-xl">?</span>
                  </div>
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Libre</span>
                </div>
              ))}
            </div>
          </section>

          {/* Check-in Section */}
          <section>
            {!hasJoined ? (
              <Card className="p-8 md:p-12 border-2 border-accent-green/30 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-accent-green/[0.03] pointer-events-none" />
                 <div className="flex flex-col items-center text-center space-y-6 relative">
                    <div className="text-6xl animate-bounce">⚽</div>
                    <div className="space-y-2">
                       <h2 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight">Tu joues ce match ?</h2>
                       <p className="text-text-secondary text-sm md:text-base font-medium">Confirme ta présence en 2 secondes et rejoins les copains.</p>
                    </div>
                    <Button 
                      onClick={() => setIsCheckInOpen(true)}
                      className="h-16 px-12 text-lg font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(0,255,135,0.2)] hover:scale-105 active:scale-95 transition-transform"
                    >
                      ✋ Je serai là !
                    </Button>
                 </div>
              </Card>
            ) : (
              <Card className="p-8 border-2 border-accent-green relative overflow-hidden bg-accent-green/10">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                       <div className="w-16 h-16 rounded-full bg-accent-green flex items-center justify-center text-black">
                          <Check size={32} strokeWidth={3} />
                       </div>
                       <div>
                          <h3 className="text-2xl font-display font-black uppercase">Tu es dans le match !</h3>
                          <p className="text-text-secondary font-medium">À mercredi {userName || "l'ami"} ! Prépare tes crampons.</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setHasJoined(false)}
                      className="text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-danger hover:underline"
                    >
                      Je ne pourrai pas jouer
                    </button>
                 </div>
              </Card>
            )}
          </section>

          {/* Teams Section */}
          {MOCK_MATCH.teamsPublished && (
            <section className="space-y-10">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tight">Les Équipes</h2>
                <div className="h-0.5 flex-1 bg-border-subtle" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-8 md:gap-4 px-4 md:px-0">
                {/* Team A */}
                <div className="space-y-6">
                  <Badge className="bg-accent-green text-black font-black uppercase tracking-[0.2em] w-full justify-center h-10 text-sm">Équipe A</Badge>
                  <div className="space-y-3">
                    {MOCK_MATCH.teams.a.map((p, i) => (
                      <motion.div 
                        key={p} 
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-background-card rounded-2xl border border-border-subtle hover:border-accent-green/20 transition-all group"
                      >
                         <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xs font-black", getAvatarColor(p))}>
                           {getInitials(p)}
                         </div>
                         <span className="font-bold uppercase tracking-wider text-sm">{p}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* VS */}
                <div className="relative py-8 flex items-center justify-center">
                   <motion.div 
                     animate={{ scale: [1, 1.05, 1] }} 
                     transition={{ duration: 2, repeat: Infinity }}
                     className="text-6xl md:text-8xl font-display font-black text-accent-green/10 absolute pointer-events-none select-none"
                   >
                     VS
                   </motion.div>
                   <div className="w-16 h-16 rounded-full bg-accent-green flex items-center justify-center text-black font-display font-black text-2xl z-10 shadow-[0_0_30px_rgba(0,255,135,0.4)]">
                     VS
                   </div>
                </div>

                {/* Team B */}
                <div className="space-y-6">
                   <Badge className="bg-background-secondary text-text-secondary border border-border-subtle font-black uppercase tracking-[0.2em] w-full justify-center h-10 text-sm">Équipe B</Badge>
                   <div className="space-y-3">
                    {MOCK_MATCH.teams.b.map((p, i) => (
                      <motion.div 
                        key={p} 
                        initial={{ x: 20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center flex-row-reverse md:flex-row gap-3 p-3 bg-background-card rounded-2xl border border-border-subtle hover:border-accent-green/20 transition-all group"
                      >
                         <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xs font-black", getAvatarColor(p))}>
                           {getInitials(p)}
                         </div>
                         <span className="font-bold uppercase tracking-wider text-sm">{p}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          
          {/* Match Details Card */}
          <Card className="p-6 space-y-6 bg-background-card border-border-subtle shadow-2xl sticky top-24">
             <div className="space-y-1">
                <h3 className="text-xl font-display font-black uppercase tracking-tight">Détails du match</h3>
                <p className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Informations pratiques</p>
             </div>

             <div className="space-y-6">
                <div className="space-y-3">
                   <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-accent-green shrink-0 mt-1" />
                      <div className="space-y-1">
                         <p className="font-bold uppercase tracking-wider text-sm leading-tight">{MOCK_MATCH.complexName}</p>
                         <p className="text-[10px] text-text-secondary leading-tight">{MOCK_MATCH.address}</p>
                      </div>
                   </div>
                   <Button 
                      variant="outline" 
                      className="w-full h-10 gap-2 border-border-subtle hover:border-accent-green"
                      onClick={() => window.open(`https://www.openstreetmap.org/search?query=${encodeURIComponent(MOCK_MATCH.address)}`, '_blank')}
                   >
                     <ExternalLink size={14} /> Voir l'itinéraire
                   </Button>
                </div>

                <div className="h-px bg-border-subtle" />

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <span className="text-[8px] uppercase font-bold text-text-tertiary tracking-widest block">Format</span>
                      <div className="flex items-center gap-1.5 font-bold uppercase text-xs tracking-wider">
                         <Users size={14} className="text-accent-green" /> {MOCK_MATCH.format}
                      </div>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[8px] uppercase font-bold text-text-tertiary tracking-widest block">Prix</span>
                      <div className="flex items-center gap-1.5 font-bold uppercase text-xs tracking-wider text-accent-green">
                         <Euro size={14} /> {MOCK_MATCH.price} DT
                      </div>
                   </div>
                </div>

                <div className="h-px bg-border-subtle" />

                <div className="space-y-3">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-background-secondary border border-border-subtle flex items-center justify-center text-text-tertiary">
                         <User size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-[8px] uppercase font-bold text-text-tertiary tracking-widest">Organisé par</p>
                         <p className="text-sm font-bold uppercase tracking-wider truncate">{MOCK_MATCH.organizer.name}</p>
                      </div>
                   </div>
                   {MOCK_MATCH.organizer.whatsappEnabled && (
                      <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white border-none gap-2 font-bold h-12 uppercase tracking-widest text-xs">
                         <MessageCircle size={18} /> WhatsApp
                      </Button>
                   )}
                </div>
             </div>
          </Card>

          {/* Share Section */}
          <Card className="p-6 space-y-6">
            <h3 className="text-xl font-display font-black uppercase tracking-tight">Partager ce match</h3>
            
            <div className="space-y-4">
               <div className="p-3 bg-background-primary border border-border-subtle rounded-xl flex items-center justify-between group">
                  <span className="font-mono text-[10px] text-accent-green truncate pr-4">{matchUrl}</span>
                  <button 
                    onClick={copyToClipboard}
                    className="shrink-0 text-text-tertiary hover:text-accent-green transition-colors"
                  >
                    {copied ? <Check size={16} className="text-accent-green" /> : <Copy size={16} />}
                  </button>
               </div>

               <Button 
                 className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white border-none gap-3 font-black h-14"
                 onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Rejoignez mon match sur Takwira.com ! " + matchUrl)}`, '_blank')}
               >
                 <Share2 size={20} /> Partager sur WhatsApp
               </Button>

               <div className="flex flex-col items-center gap-4 pt-4 border-t border-border-subtle">
                  <div className="p-4 bg-white rounded-2xl shadow-xl">
                    <QRCodeSVG 
                      value={matchUrl} 
                      size={120}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-[8px] uppercase font-bold text-text-tertiary tracking-[0.2em] text-center">Scannez le code pour rejoindre</p>
               </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Check-in Sheet (Mobile) / Modal (Desktop) */}
      <AnimatePresence>
        {isCheckInOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckInOpen(false)}
              className="fixed inset-0 z-[200] bg-overlay"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[210] lg:relative lg:inset-center lg:z-auto bg-background-card rounded-t-[32px] p-8 pb-12 lg:rounded-3xl border-t border-border-subtle lg:max-w-md lg:mx-auto lg:top-1/2 lg:-translate-y-1/2 lg:fixed"
            >
               <div className="w-12 h-1.5 bg-border-subtle rounded-full mx-auto mb-8 lg:hidden" />
               <div className="flex justify-between items-start mb-8">
                  <h3 className="text-3xl font-display font-black uppercase leading-none">Confirmer ta <br /> présence</h3>
                  <button onClick={() => setIsCheckInOpen(false)} className="text-text-tertiary hover:text-white lg:hidden">
                    <X size={24} />
                  </button>
               </div>

               <form onSubmit={handleJoin} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Ton prénom</label>
                       <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent-green transition-colors">
                             <User size={18} />
                          </div>
                          <input 
                            required
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full bg-background-secondary border border-border-subtle focus:border-accent-green focus:outline-none rounded-xl pl-12 pr-4 h-14 font-sans text-sm transition-all"
                            placeholder="Ahmed, Sami..."
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Ton numéro (optionnel)</label>
                       <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent-green transition-colors">
                             <Phone size={18} />
                          </div>
                          <input 
                            type="tel"
                            className="w-full bg-background-secondary border border-border-subtle focus:border-accent-green focus:outline-none rounded-xl pl-12 pr-4 h-14 font-sans text-sm transition-all"
                            placeholder="+216 00 000 000"
                          />
                       </div>
                       <p className="text-[9px] text-text-tertiary font-medium pl-1 leading-relaxed">
                         Optionnel. Si tu veux être contacté en cas de changement de dernière minute.
                       </p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isJoining}
                    className="w-full h-16 font-black uppercase tracking-widest shadow-2xl shadow-accent-green/20"
                  >
                    {isJoining ? <Loader2 className="animate-spin" /> : "Confirmer ma présence !"}
                  </Button>
               </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .inset-center {
           left: 50%;
           transform: translate(-50%, -50%);
        }
      `}</style>

    </div>
  );
}

// Re-using these from standard icons
function Euro(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10h12" />
      <path d="M4 14h9" />
      <path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12a7.9 7.9 0 0 0 7.8 8 7.7 7.7 0 0 0 5.2-2" />
    </svg>
  );
}
