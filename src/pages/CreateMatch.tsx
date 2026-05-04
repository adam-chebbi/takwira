import * as React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  MapPin, 
  Check, 
  ChevronRight,
  Search,
  Plus
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/contexts/AuthContext';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { trackMatchCreated } from '@/src/lib/googleAds';
import { Terrain } from '@/src/lib/schema';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CreateMatch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [step, setStep] = React.useState(1);
  
  // Form State
  const [title, setTitle] = React.useState('');
  const [useCustomLocation, setUseCustomLocation] = React.useState(false);
  const [customLocation, setCustomLocation] = React.useState('');
  const [selectedTerrain, setSelectedTerrain] = React.useState<Terrain | null>(null);
  const [terrains, setTerrains] = React.useState<Terrain[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [date, setDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = React.useState('19:00');
  const [endTime, setEndTime] = React.useState('20:00');
  const [formatType, setFormatType] = React.useState<'6vs6' | '7vs7'>('6vs6');
  const [maxPlayers, setMaxPlayers] = React.useState(12);

  React.useEffect(() => {
    const fetchTerrains = async () => {
      try {
        const q = query(collection(db, 'terrains'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Terrain));
        setTerrains(data);
      } catch (err) {
        console.error("Error fetching terrains:", err);
      }
    };
    fetchTerrains();
  }, []);

  const filteredTerrains = terrains.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.complexName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFormatChange = (f: '6vs6' | '7vs7') => {
    setFormatType(f);
    setMaxPlayers(f === '6vs6' ? 12 : 14);
  };

  const handleCreateMatch = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const linkToken = Math.random().toString(36).substring(2, 12);
      
      const matchData = {
        title: title || `Match de ${user.displayName || 'Foot'}`,
        organizerId: user.uid,
        date,
        startTime,
        endTime,
        format: formatType,
        maxPlayers,
        terrainId: useCustomLocation ? null : selectedTerrain?.id || null,
        terrainName: useCustomLocation ? customLocation : selectedTerrain?.name || 'Localisation personnalisée',
        complexName: useCustomLocation ? 'Sur-mesure' : selectedTerrain?.complexName || '',
        status: 'upcoming',
        linkToken,
        teamsPublished: false,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'matches'), matchData);
      trackMatchCreated();
      
      // Auto-join organizer
      await addDoc(collection(db, 'matchPlayers'), {
        matchId: docRef.id,
        userId: user.uid,
        playerName: user.displayName || 'Organisateur',
        playerPhone: '',
        status: 'confirmed',
        joinedAt: serverTimestamp()
      });

      navigate(`/match/${linkToken}`);
    } catch (err) {
      console.error("Error creating match:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow pt-24 pb-20 px-4 md:px-6">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-display font-black uppercase tracking-tight text-pl-purple italic">Organiser un match</h1>
          <p className="text-text-tertiary text-sm">Crée ton match, partage le lien et laisse Takwira gérer le reste.</p>
        </div>

        {/* Form Steps */}
        <div className="space-y-6">
          {step === 1 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="p-6 space-y-6 bg-background-card/50 backdrop-blur-xl border-border-subtle">
                <Input 
                  label="Titre du match"
                  placeholder="Ex: Match du Mardi soir"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-text-tertiary">Lieu du match</label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setUseCustomLocation(false)}
                      className={cn(
                        "p-4 rounded-xl border transition-all flex flex-col items-center gap-2 text-center",
                        !useCustomLocation ? "bg-accent-green/10 border-accent-green text-accent-green" : "bg-background-secondary border-border-subtle text-text-tertiary"
                      )}
                    >
                      <MapPin size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Terrain Takwira</span>
                    </button>
                    <button 
                      onClick={() => setUseCustomLocation(true)}
                      className={cn(
                        "p-4 rounded-xl border transition-all flex flex-col items-center gap-2 text-center",
                        useCustomLocation ? "bg-accent-green/10 border-accent-green text-accent-green" : "bg-background-secondary border-border-subtle text-text-tertiary"
                      )}
                    >
                      <Plus size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Adresse perso</span>
                    </button>
                  </div>

                  {!useCustomLocation ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                        <input 
                          type="text"
                          placeholder="Rechercher un terrain..."
                          className="w-full h-12 bg-background-secondary border border-border-subtle rounded-xl pl-12 pr-4 text-sm focus:border-accent-green outline-none"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-2 no-scrollbar">
                        {filteredTerrains.map(t => (
                          <div 
                            key={t.id}
                            onClick={() => setSelectedTerrain(t)}
                            className={cn(
                              "p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all",
                              selectedTerrain?.id === t.id ? "bg-white/5 border-accent-green" : "bg-transparent border-transparent hover:bg-background-secondary"
                            )}
                          >
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-white">{t.name}</p>
                              <p className="text-[10px] text-text-tertiary">{t.complexName}</p>
                            </div>
                            {selectedTerrain?.id === t.id && <Check size={14} className="text-accent-green" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Input 
                      placeholder="Ex: Terrain municipal de Tunis"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                    />
                  )}
                </div>

                <Button 
                  onClick={() => setStep(2)} 
                  disabled={!useCustomLocation ? !selectedTerrain : !customLocation}
                  className="w-full h-14 uppercase tracking-widest font-black"
                >
                  Suivant <ChevronRight size={18} />
                </Button>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="p-6 space-y-8 bg-background-card/50 backdrop-blur-xl border-border-subtle">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-text-tertiary">Date</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                      <input 
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full h-14 bg-background-secondary border border-border-subtle rounded-xl pl-12 pr-4 text-sm focus:border-accent-green outline-none text-white transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-text-tertiary">Format</label>
                    <div className="flex bg-background-secondary p-1 rounded-xl border border-border-subtle h-14">
                      <button 
                        onClick={() => handleFormatChange('6vs6')}
                        className={cn(
                          "flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                          formatType === '6vs6' ? "bg-accent-green text-black" : "text-text-tertiary hover:text-white"
                        )}
                      >6vs6</button>
                      <button 
                        onClick={() => handleFormatChange('7vs7')}
                        className={cn(
                          "flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                          formatType === '7vs7' ? "bg-accent-green text-black" : "text-text-tertiary hover:text-white"
                        )}
                      >7vs7</button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-text-tertiary">Début</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                      <input 
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full h-14 bg-background-secondary border border-border-subtle rounded-xl pl-12 pr-4 text-sm focus:border-accent-green outline-none text-white transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-text-tertiary">Fin</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                      <input 
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full h-14 bg-background-secondary border border-border-subtle rounded-xl pl-12 pr-4 text-sm focus:border-accent-green outline-none text-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-text-tertiary">Nombre de joueurs max</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range"
                      min="4"
                      max="22"
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                      className="flex-1 accent-accent-green"
                    />
                    <div className="w-14 h-14 bg-accent-green/10 border border-accent-green rounded-xl flex items-center justify-center font-display font-black text-xl text-accent-green italic">
                      {maxPlayers}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1 h-16 uppercase tracking-widest font-black"
                  >
                    Retour
                  </Button>
                  <Button 
                    onClick={handleCreateMatch}
                    disabled={loading}
                    className="flex-[2] h-16 uppercase font-black tracking-[0.2em] shadow-2xl shadow-accent-green/20"
                  >
                    {loading ? "Création..." : "Lancer le match"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
