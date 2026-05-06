import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  MapPin, 
  Map as MapIcon, 
  Calendar, 
  Clock, 
  Users, 
  Search, 
  Check, 
  Target,
  Loader2,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { db } from '@/src/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useToast } from '@/src/components/ui/Toast';
import { cn } from '@/src/lib/utils';
import { Terrain } from '@/src/lib/schema';
import slugify from 'slugify';

const FORMATS = [
  { label: '6 vs 6', value: '6v6', players: 12 },
  { label: '7 vs 7', value: '7v7', players: 14 }
];

export default function CreateMatch() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  // Form State
  const [title, setTitle] = React.useState('');
  const [locationType, setLocationType] = React.useState<'takwira' | 'custom'>('takwira');
  const [selectedTerrain, setSelectedTerrain] = React.useState<Terrain | null>(null);
  const [customLocation, setCustomLocation] = React.useState('');
  const [date, setDate] = React.useState('');
  const [startTime, setStartTime] = React.useState('');
  const [endTime, setEndTime] = React.useState('');
  const [format, setFormat] = React.useState(FORMATS[0]);
  const [maxPlayers, setMaxPlayers] = React.useState(FORMATS[0].players);
  
  // Search State
  const [searchQuery, setSearchQuery] = React.useState('');
  const [terrains, setTerrains] = React.useState<Terrain[]>([]);
  const [loadingTerrains, setLoadingTerrains] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Sync max players with format choice
  React.useEffect(() => {
    setMaxPlayers(format.players);
  }, [format]);

  // Fetch terrains when searching
  React.useEffect(() => {
    const fetchTerrains = async () => {
      if (locationType !== 'takwira') return;
      setLoadingTerrains(true);
      try {
        const q = query(collection(db, 'terrains'), where('status', '==', 'active'));
        const snapshot = await getDocs(q);
        const fetchedTerrains = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Terrain));
        
        // Simple client-side search for demo purposes
        if (searchQuery) {
          setTerrains(fetchedTerrains.filter(t => 
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            t.complexName.toLowerCase().includes(searchQuery.toLowerCase())
          ));
        } else {
          setTerrains(fetchedTerrains);
        }
      } catch (err) {
        console.error("Error fetching terrains:", err);
      } finally {
        setLoadingTerrains(false);
      }
    };

    const timer = setTimeout(fetchTerrains, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, locationType]);

  const generateLinkToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 12; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title) {
      toast("Un titre est requis pour créer un match.", 'error');
      return;
    }

    if (locationType === 'takwira' && !selectedTerrain) {
      toast("Sélectionne un terrain Takwira ou choisis un lieu personnalisé.", 'error');
      return;
    }

    if (locationType === 'custom' && !customLocation) {
      toast("Saisis l'adresse ou le nom du lieu.", 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const linkToken = generateLinkToken();
      const matchData = {
        title,
        linkToken,
        organizerId: user.uid,
        organizerName: userProfile?.name || 'Organisateur',
        organizerAvatar: userProfile?.avatarUrl || '',
        locationType,
        terrainId: locationType === 'takwira' ? selectedTerrain?.id : null,
        complexId: locationType === 'takwira' ? selectedTerrain?.complexId : null,
        managerId: locationType === 'takwira' ? selectedTerrain?.managerId : null,
        terrainName: locationType === 'takwira' ? selectedTerrain?.name : null,
        complexName: locationType === 'takwira' ? selectedTerrain?.complexName : null,
        customLocation: locationType === 'custom' ? customLocation : null,
        date,
        startTime,
        endTime,
        format: format.value,
        maxPlayers,
        currentPlayerCount: 1, // Organizer joins automatically
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const matchRef = await addDoc(collection(db, 'matches'), matchData);

      // Add organizer to matchPlayers
      await addDoc(collection(db, 'matchPlayers'), {
        matchId: matchRef.id,
        userId: user.uid,
        userName: userProfile?.name || 'Organisateur',
        userAvatar: userProfile?.avatarUrl || '',
        status: 'confirmed',
        role: 'organizer',
        joinedAt: serverTimestamp()
      });

      toast("Match créé ! Partage le lien avec tes amis.", 'success');
      navigate(`/match/${linkToken}`);
    } catch (err) {
      console.error("Error creating match:", err);
      toast("Une erreur est survenue lors de la création du match.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-primary pb-24">
      {/* Header */}
      <div className="sticky top-20 lg:top-[120px] z-30 bg-background-primary/80 backdrop-blur-xl border-b border-border-subtle p-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
           <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-text-primary">
              <ChevronLeft size={24} />
           </button>
           <h1 className="text-sm font-black uppercase tracking-widest text-text-primary">ORGANISER UN MATCH</h1>
           <div className="w-10" />
        </div>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title Section */}
          <section className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Titre du Match</label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Derby du Vendredi"
                className="h-14 bg-background-card border-border-subtle rounded-2xl text-lg font-bold"
                required
              />
            </div>
          </section>

          {/* Location Selection */}
          <section className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Emplacement</label>
            <div className="grid grid-cols-2 gap-2 bg-background-secondary p-1 rounded-2xl border border-border-subtle">
              <button
                type="button"
                onClick={() => setLocationType('takwira')}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  locationType === 'takwira' ? "bg-accent-green text-black shadow-lg" : "text-text-tertiary"
                )}
              >
                <Target size={14} /> Terrain Takwira
              </button>
              <button
                type="button"
                onClick={() => setLocationType('custom')}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  locationType === 'custom' ? "bg-accent-green text-black shadow-lg" : "text-text-tertiary"
                )}
              >
                <MapPin size={14} /> Lieu personnalisé
              </button>
            </div>

            {locationType === 'takwira' ? (
              <div className="space-y-4 pt-2">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Chercher un terrain..."
                    className="h-12 pl-12 bg-background-card border-border-subtle rounded-2xl text-sm"
                  />
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {loadingTerrains ? (
                    <div className="py-10 flex justify-center">
                      <Loader2 size={24} className="animate-spin text-accent-green" />
                    </div>
                  ) : terrains.length > 0 ? (
                    terrains.map((terrain) => (
                      <button
                        key={terrain.id}
                        type="button"
                        onClick={() => setSelectedTerrain(terrain)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-3xl border transition-all text-left group",
                          selectedTerrain?.id === terrain.id 
                            ? "bg-accent-green/10 border-accent-green shadow-[0_0_20px_rgba(34,197,94,0.1)]" 
                            : "bg-background-card border-border-subtle hover:border-text-tertiary"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-background-secondary flex items-center justify-center text-text-tertiary overflow-hidden shrink-0">
                             {terrain.photos?.[0] ? (
                               <img src={terrain.photos[0]} className="w-full h-full object-cover" alt="" />
                             ) : (
                               <MapIcon size={20} />
                             )}
                          </div>
                          <div>
                            <p className={cn(
                              "text-sm font-black uppercase tracking-tight transition-colors",
                              selectedTerrain?.id === terrain.id ? "text-accent-green" : "text-text-primary"
                            )}>
                              {terrain.name}
                            </p>
                            <p className="text-[10px] font-bold text-text-tertiary uppercase">{terrain.complexName} • {terrain.type}</p>
                          </div>
                        </div>
                        {selectedTerrain?.id === terrain.id && (
                          <div className="w-6 h-6 rounded-full bg-accent-green flex items-center justify-center text-black">
                            <Check size={14} strokeWidth={4} />
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="py-10 text-center space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Aucun terrain trouvé</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <Input 
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Ex: Stade de la ville, Adresse précise..."
                  className="h-14 bg-background-card border-border-subtle rounded-2xl text-sm"
                />
                <p className="text-[10px] text-text-tertiary italic flex items-center gap-2 px-2">
                  <Info size={12} /> Précise le lieu exact pour tes amis.
                </p>
              </div>
            )}
          </section>

          {/* Date & Time Selection */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Date</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                  <input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-background-card border border-border-subtle rounded-2xl text-sm font-bold text-text-primary focus:border-accent-green outline-none appearance-none"
                    required
                  />
                </div>
             </div>
             
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Plage Horaire</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                    <input 
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full h-14 pl-10 pr-2 bg-background-card border border-border-subtle rounded-2xl text-sm font-bold text-text-primary focus:border-accent-green outline-none appearance-none"
                      required
                    />
                  </div>
                  <span className="text-text-tertiary">à</span>
                  <div className="relative flex-1">
                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                    <input 
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full h-14 pl-10 pr-2 bg-background-card border border-border-subtle rounded-2xl text-sm font-bold text-text-primary focus:border-accent-green outline-none appearance-none"
                      required
                    />
                  </div>
                </div>
             </div>
          </section>

          {/* Format Selection */}
          <section className="space-y-4">
             <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Format & Joueurs</label>
             </div>
             <div className="grid grid-cols-2 gap-4">
                {FORMATS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-6 rounded-[32px] border transition-all",
                      format.value === f.value 
                        ? "bg-pl-purple/10 border-pl-purple shadow-[0_0_20px_rgba(109,40,217,0.1)]" 
                        : "bg-background-card border-border-subtle hover:border-text-tertiary"
                    )}
                  >
                    <Users size={24} className={cn(format.value === f.value ? "text-pl-purple" : "text-text-tertiary")} />
                    <span className={cn(
                      "text-sm font-black uppercase tracking-widest",
                      format.value === f.value ? "text-pl-purple" : "text-text-primary"
                    )}>{f.label}</span>
                  </button>
                ))}
             </div>

             <div className="flex items-center justify-between p-6 bg-background-secondary rounded-[32px] border border-border-subtle">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-background-card flex items-center justify-center text-pl-purple">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Nombre Max de Joueurs</p>
                    <p className="text-sm font-black uppercase text-text-primary">{maxPlayers} Joueurs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                     type="button" 
                     onClick={() => setMaxPlayers(prev => Math.max(2, prev - 1))}
                     className="w-10 h-10 rounded-xl bg-background-card border border-border-subtle flex items-center justify-center text-text-primary hover:bg-background-secondary active:scale-95 transition-all"
                   >
                     -
                   </button>
                   <button 
                     type="button" 
                     onClick={() => setMaxPlayers(prev => prev + 1)}
                     className="w-10 h-10 rounded-xl bg-background-card border border-border-subtle flex items-center justify-center text-text-primary hover:bg-background-secondary active:scale-95 transition-all"
                   >
                     +
                   </button>
                </div>
             </div>
          </section>

          {/* Submit Button */}
          <Button 
            disabled={isSubmitting}
            className="w-full h-16 rounded-[24px] bg-accent-green text-black font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-[0_12px_40px_rgba(34,197,94,0.3)] mt-8"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin text-black" size={24} />
            ) : (
              "Créer & Partager le Lien"
            )}
          </Button>

          <p className="text-[10px] text-text-tertiary text-center uppercase font-bold tracking-widest px-4 leading-relaxed">
            En créant ce match, tu deviens l'organisateur. Tu pourras valider les présences et gérer les équipes.
          </p>
        </form>
      </div>
    </div>
  );
}
