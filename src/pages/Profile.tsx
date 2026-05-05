import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  MapPin, 
  Trophy, 
  Settings, 
  Heart, 
  ChevronRight, 
  LogOut, 
  Trash2, 
  User, 
  Phone, 
  Bell, 
  Globe, 
  Star,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  X,
  CreditCard,
  Plus,
  Minus,
  Info
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/contexts/AuthContext';
import { useCookie } from '@/src/contexts/CookieContext';
import { db, auth as firebaseAuth } from '@/src/lib/firebase';
import { 
  doc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getCountFromServer, 
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/src/components/ui/Toast';
import JerseyPreview from '@/src/components/profile/JerseyPreview';

// --- Constants ---
const GOVERNORATES = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Bizerte", "Nabeul", "Zaghouan", "Béja", 
  "Jendouba", "Le Kef", "Siliana", "Sousse", "Monastir", "Mahdia", "Sfax", "Kairouan", 
  "Kasserine", "Sidi Bouzid", "Gabès", "Médenine", "Tataouine", "Gafsa", "Tozeur", "Kebili"
];

const AVATAR_COLORS = [
  "#FF6B00", "#00D1FF", "#FF4B4B", "#32CD32", "#9D00FF", "#00BFA5", "#FFD700", "#FF007A",
];

// --- Sub-components ---
const Counter = ({ target, duration = 1.5 }: { target: number, duration?: number }) => {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <>{count}</>;
};

// --- Main Component ---
export default function Profile() {
  const { user, userProfile, signOut, refreshProfile } = useAuth();
  const { resetConsent, canTrackAnalytics, canTrackAdvertising } = useCookie();
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTab, setActiveTab] = React.useState<'matchs' | 'favoris' | 'config'>('matchs');
  const [matchTab, setMatchTab] = React.useState<'avenir' | 'histo'>('avenir');
  
  // Data State
  const [stats, setStats] = React.useState({ played: 0, organized: 0, terrains: 0 });
  const [matches, setMatches] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Modals
  const [showJerseyModal, setShowJerseyModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showReviewModal, setShowReviewModal] = React.useState<{matchId: string, terrainId: string} | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState('');

  React.useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const playedQuery = query(collection(db, 'matchPlayers'), where('userId', '==', user.uid));
        const organizedQuery = query(collection(db, 'matches'), where('organizerId', '==', user.uid));
        const reservationsQuery = query(collection(db, 'reservations'), where('organizerId', '==', user.uid));

        const [playedCount, organizedCount, reservationsSnapshot] = await Promise.all([
          getCountFromServer(playedQuery),
          getCountFromServer(organizedQuery),
          getDocs(reservationsQuery)
        ]);

        const uniqueTerrains = new Set(reservationsSnapshot.docs.map(doc => doc.data().terrainId));

        setStats({
          played: playedCount.data().count,
          organized: organizedCount.data().count,
          terrains: uniqueTerrains.size
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    const unsubscribe = onSnapshot(
      query(collection(db, 'reservations'), where('organizerId', '==', user.uid), orderBy('date', 'desc')),
      (snapshot) => {
        setMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }
    );

    fetchStats();
    return () => unsubscribe();
  }, [user]);

  const handleUpdateField = async (field: string, value: any) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { [field]: value });
      await refreshProfile();
      toast("Profil mis à jour", "success");
    } catch (err) {
      toast("Erreur lors de la mise à jour", "error");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'SUPPRIMER' || !user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);
      toast("Compte supprimé avec succès", "success");
      navigate('/');
    } catch (err) {
      toast("Erreur lors de la suppression. Veuillez vous reconnecter et réessayer.", "error");
    }
  };

  if (!user || !userProfile) return null;

  const upcomingMatches = matches.filter(m => new Date(m.date) >= new Date() && m.status !== 'cancelled');
  const pastMatches = matches.filter(m => new Date(m.date) < new Date() || m.status === 'cancelled');

  return (
    <div className="flex-grow bg-background-primary pt-32 pb-32">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center space-y-6 mb-16">
          <div className="relative">
            {userProfile.jerseyName ? (
              <div className="h-[200px] flex items-center justify-center">
                <JerseyPreview 
                  color={userProfile.jerseyColor as any || 'red'}
                  name={userProfile.jerseyName}
                  number={userProfile.jerseyNumber}
                  size="md"
                />
              </div>
            ) : (
              <div 
                className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-display font-black text-white uppercase shadow-2xl relative z-10"
                style={{ backgroundColor: userProfile.avatarColor || '#FF6B00' }}
              >
                {userProfile.firstName?.[0]}{userProfile.lastName?.[0]}
              </div>
            )}
            
            <button 
              onClick={() => setActiveTab('config')}
              className="absolute bottom-2 right-2 z-20 w-8 h-8 rounded-full bg-background-card border border-border-subtle flex items-center justify-center text-text-muted hover:text-pl-green hover:scale-110 transition-all shadow-xl"
            >
              <Camera size={16} />
            </button>
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl font-display font-black uppercase tracking-tight text-white leading-none">
              {userProfile.firstName} {userProfile.lastName}
            </h1>
            <div className="flex items-center justify-center gap-2 text-text-secondary text-sm font-medium">
              <MapPin size={16} className="text-pl-green" /> {userProfile.city}
              <span className="w-1.5 h-1.5 rounded-full bg-border-subtle" />
              <Badge className="bg-pl-green/10 text-pl-green border-pl-green/20 uppercase font-black text-[9px] tracking-widest h-6">
                {userProfile.role === 'manager' ? 'Gérant' : 'Joueur'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-16 px-2 md:px-0">
          {[
            { label: "Matches Joués", count: stats.played, icon: Trophy, color: "text-pl-green" },
            { label: "Matches Organisés", count: stats.organized, icon: Users, color: "text-pl-purple" },
            { label: "Terrains Visités", count: stats.terrains, icon: MapPin, color: "text-accent-blue" }
          ].map((stat, i) => (
            <Card key={i} className="p-4 md:p-6 text-center space-y-2 group overflow-hidden border-border-subtle relative hover:border-pl-green/30 transition-colors">
              <stat.icon size={20} className="mx-auto text-text-muted group-hover:text-pl-green transition-colors" />
              <div className="space-y-0.5 relative">
                <p className={cn("text-2xl md:text-4xl font-display font-black leading-none", stat.color)}>
                  <Counter target={stat.count} />
                </p>
                <p className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-text-muted">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs Navigation */}
        <div className="flex bg-background-secondary p-1 rounded-2xl border border-border-subtle sticky top-24 z-30 shadow-xl lg:w-max lg:mx-auto mb-10">
          {[
            { id: 'matchs', label: 'Mes Matchs', icon: Trophy },
            { id: 'favoris', label: 'Favoris', icon: Heart },
            { id: 'config', label: 'Paramètres', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 md:flex-none md:min-w-[140px] h-12 flex items-center justify-center gap-2 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest",
                activeTab === tab.id ? "bg-pl-green text-black" : "text-text-muted hover:text-pl-purple"
              )}
            >
              <tab.icon size={16} /> <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'matchs' && (
            <motion.div 
              key="matchs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex gap-4 border-b border-border-subtle">
                <button 
                  onClick={() => setMatchTab('avenir')}
                  className={cn(
                    "pb-4 px-2 font-display font-bold uppercase text-lg tracking-tight relative",
                    matchTab === 'avenir' ? "text-pl-green" : "text-text-muted hover:text-text-secondary"
                  )}
                >
                  À venir
                  {matchTab === 'avenir' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-1 bg-pl-green rounded-t-full" />}
                </button>
                <button 
                  onClick={() => setMatchTab('histo')}
                  className={cn(
                    "pb-4 px-2 font-display font-bold uppercase text-lg tracking-tight relative",
                    matchTab === 'histo' ? "text-pl-green" : "text-text-muted hover:text-text-secondary"
                  )}
                >
                  Historique
                  {matchTab === 'histo' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-1 bg-pl-green rounded-t-full" />}
                </button>
              </div>

              <div className="grid gap-6">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-32 bg-background-card rounded-2xl animate-pulse border border-border-subtle" />
                  ))
                ) : (matchTab === 'avenir' ? upcomingMatches : pastMatches).length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <Trophy size={48} className="mx-auto text-text-tertiary" />
                    <h3 className="text-xl font-display font-black uppercase text-pl-purple">Aucun match trouvé</h3>
                    <p className="text-text-tertiary text-sm">Tes futurs matchs apparaîtront ici.</p>
                  </div>
                ) : (matchTab === 'avenir' ? upcomingMatches : pastMatches).map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    type={matchTab === 'avenir' ? 'upcoming' : 'history'} 
                    onReview={() => setShowReviewModal({ matchId: match.id, terrainId: match.terrainId })}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'config' && (
            <motion.div 
              key="config"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-pl-purple px-1">Informations Personnelles</h3>
                <Card className="divide-y divide-border-subtle overflow-hidden">
                  <SettingRow 
                    label="Prénom" 
                    value={userProfile.firstName} 
                    onSave={(val) => handleUpdateField('firstName', val)}
                  />
                  <SettingRow 
                    label="Nom" 
                    value={userProfile.lastName} 
                    onSave={(val) => handleUpdateField('lastName', val)}
                  />
                  <SettingRow 
                    label="Ville" 
                    value={userProfile.city} 
                    type="select"
                    options={GOVERNORATES}
                    onSave={(val) => handleUpdateField('city', val)}
                  />
                </Card>
              </div>

              {/* Identity */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-pl-purple px-1">Identité & Maillot</h3>
                <Card className="p-8 space-y-8">
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="shrink-0">
                       <JerseyPreview 
                          color={userProfile.jerseyColor as any || 'red'}
                          name={userProfile.jerseyName}
                          number={userProfile.jerseyNumber}
                          size="md"
                       />
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                       <div className="space-y-2">
                          <p className="text-xs font-bold uppercase tracking-widest text-text-tertiary">Couleur de l'Avatar</p>
                          <div className="flex flex-wrap gap-3">
                             {AVATAR_COLORS.map(color => (
                               <button 
                                 key={color}
                                 onClick={() => handleUpdateField('avatarColor', color)}
                                 className={cn(
                                   "w-8 h-8 rounded-full border-2 transition-all",
                                   userProfile.avatarColor === color ? "border-pl-green scale-125" : "border-transparent"
                                 )}
                                 style={{ backgroundColor: color }}
                               />
                             ))}
                          </div>
                       </div>
                       <Button 
                         variant="outline" 
                         className="w-full h-12 uppercase font-black text-xs tracking-widest gap-2"
                         onClick={() => setShowJerseyModal(true)}
                       >
                         <Pencil size={16} /> Modifier mon maillot
                       </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Preferences */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-pl-purple px-1">Préférences</h3>
                <Card className="divide-y divide-border-subtle overflow-hidden">
                  <div className="px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center text-text-muted">
                        <Bell size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Notifications Push</p>
                        <p className="text-sm font-bold text-text-secondary">Recevoir les alertes de match</p>
                      </div>
                    </div>
                    <div 
                      className={cn(
                        "w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200",
                        userProfile.notificationsEnabled ? "bg-pl-green" : "bg-background-tertiary"
                      )}
                      onClick={() => handleUpdateField('notificationsEnabled', !userProfile.notificationsEnabled)}
                    >
                      <motion.div 
                        animate={{ x: userProfile.notificationsEnabled ? 24 : 0 }}
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="px-6 py-5 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center text-text-muted">
                           <Globe size={20} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Cookies</p>
                           <p className="text-sm font-bold text-text-secondary">Gérer mes consentements</p>
                        </div>
                     </div>
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-pl-green uppercase font-black text-[10px] tracking-widest"
                        onClick={resetConsent}
                      >
                        Modifier
                      </Button>
                  </div>
                </Card>
              </div>

              {/* Danger Zone */}
              <div className="pt-8 space-y-6">
                <Button 
                  variant="outline" 
                  fullWidth
                  onClick={async () => {
                    await signOut();
                    navigate('/');
                  }}
                  className="h-16 border-danger/30 text-danger hover:bg-danger hover:text-white gap-3 font-black uppercase tracking-widest text-sm shadow-lg overflow-hidden group"
                >
                   <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> Se déconnecter
                </Button>

                <div className="p-8 rounded-3xl border border-danger/20 bg-danger/5 flex flex-col items-center gap-6 text-center">
                   <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center text-danger">
                      <AlertTriangle size={28} />
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-xl font-display font-black uppercase text-danger">Zone de danger</h4>
                      <p className="text-text-tertiary text-sm max-w-sm">
                        La suppression de ton compte est irréversible. Toutes tes données seront effacées.
                      </p>
                   </div>
                   <Button 
                     variant="ghost"
                     onClick={() => setShowDeleteModal(true)}
                     className="text-danger font-black uppercase tracking-widest text-xs hover:bg-danger/10 px-8 h-12"
                   >
                     Supprimer mon compte
                   </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals Implementation */}
      <AnimatePresence>
        {showJerseyModal && (
          <JerseyModal 
            data={{ 
              jerseyColor: userProfile.jerseyColor || 'red',
              jerseyName: userProfile.jerseyName || '',
              jerseyNumber: userProfile.jerseyNumber || 10
            }}
            onClose={() => setShowJerseyModal(false)}
            onSave={(fields) => {
              Object.entries(fields).forEach(([f, v]) => handleUpdateField(f, v));
              setShowJerseyModal(false);
            }}
          />
        )}

        {showDeleteModal && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-background-card rounded-[32px] border border-border-subtle p-8 space-y-8"
              >
                 <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-danger/10 rounded-3xl flex items-center justify-center text-danger mx-auto">
                       <Trash2 size={40} />
                    </div>
                    <h3 className="text-3xl font-display font-black uppercase text-white">Confirmation</h3>
                    <p className="text-text-tertiary text-sm">
                      Toutes tes réservations, matchs et préférences seront supprimés définitivement.
                    </p>
                 </div>

                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary text-center">Tape "SUPPRIMER" pour confirmer</p>
                    <input 
                      type="text"
                      placeholder="SUPPRIMER"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value.toUpperCase())}
                      className="w-full h-16 bg-background-secondary border border-border-subtle rounded-2xl text-center font-display font-black text-2xl tracking-[0.2em] focus:outline-none focus:border-danger transition-all placeholder:opacity-20"
                    />
                 </div>

                 <div className="flex gap-4">
                    <Button variant="outline" fullWidth onClick={() => setShowDeleteModal(false)}>Annuler</Button>
                    <Button 
                      fullWidth 
                      className="bg-danger hover:bg-danger-hover text-white"
                      disabled={deleteConfirm !== 'SUPPRIMER'}
                      onClick={handleDeleteAccount}
                    >
                      Supprimer
                    </Button>
                 </div>
              </motion.div>
           </div>
        )}

        {showReviewModal && (
          <ReviewModal 
            onClose={() => setShowReviewModal(null)}
            onSubmit={async (rating, comment) => {
               try {
                 await addDoc(collection(db, `terrains/${showReviewModal.terrainId}/reviews`), {
                   userId: user.uid,
                   authorName: `${userProfile.firstName} ${userProfile.lastName}`,
                   rating,
                   comment,
                   createdAt: serverTimestamp()
                 });
                 toast("Merci pour votre avis !", "success");
                 setShowReviewModal(null);
               } catch (err) {
                 toast("Erreur lors de l'envoi de l'avis", "error");
               }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Card Components ---

function MatchCard({ match, type, onReview }: { match: any, type: 'upcoming' | 'history', onReview: () => void }) {
  const isOrganizer = match.organizerId === firebaseAuth.currentUser?.uid;

  return (
    <div className={cn(
      "group relative overflow-hidden bg-background-card border border-border-subtle rounded-2xl transition-all hover:border-pl-green/30",
      type === 'history' && "opacity-70 grayscale-[0.3]"
    )}>
      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
             <Badge className={cn("font-black text-[10px] uppercase h-6 px-3", type === 'upcoming' ? 'bg-pl-green/10 text-pl-green' : 'bg-background-secondary text-text-tertiary')}>
               {type === 'upcoming' ? 'À venir' : 'Terminé'}
             </Badge>
             <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">{match.id.slice(-8)}</span>
          </div>
          
          <div className="space-y-1">
             <h3 className="text-2xl font-display font-black uppercase tracking-tight leading-none text-white">{match.matchTitle || "Match Amical"}</h3>
             <div className="flex items-center gap-2 text-text-secondary text-xs">
                <MapPin size={14} className="text-pl-green" />
                {match.complexName || "Terrain Local"}
             </div>
          </div>
        </div>

        <div className="h-px md:h-16 w-full md:w-px bg-border-subtle md:border-l border-dashed" />

        <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-2">
           <div className="flex flex-col md:items-end">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">{new Date(match.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}</span>
              <span className="text-2xl font-display font-black leading-none text-pl-green">{match.startTime}</span>
           </div>
        </div>
      </div>
      
      <div className="bg-background-secondary/50 px-8 py-4 border-t border-border-subtle flex items-center justify-between">
         <div className="flex gap-4">
            <Link to={`/match/${match.matchId || match.id}`} className="text-[10px] font-black uppercase tracking-widest text-pl-green hover:underline">Voir le match →</Link>
            {isOrganizer && type === 'upcoming' && (
              <Link to={`/match/${match.matchId || match.id}/manage`} className="text-[10px] font-black uppercase tracking-widest text-pl-purple hover:underline">Gérer →</Link>
            )}
         </div>
         
         {type === 'history' && (
           <button 
             onClick={onReview}
             className="text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-white flex items-center gap-2 group/avis"
           >
              <Star size={14} className="group-hover/avis:text-pl-green transition-colors" /> Laisser un avis
           </button>
         )}
      </div>
    </div>
  );
}

function SettingRow({ label, value, onSave, options, type = 'text' }: { label: string, value: string, onSave: (val: string) => void, options?: string[], type?: 'text' | 'select' }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempValue, setTempValue] = React.useState(value);

  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  return (
    <div className="px-6 py-5 flex items-center justify-between group h-[88px]">
       <div className="space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{label}</p>
          {isEditing ? (
             <div className="flex items-center gap-3">
                {type === 'select' ? (
                  <select 
                    autoFocus
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="bg-background-tertiary border border-border-subtle rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-pl-green"
                  >
                    {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input 
                    autoFocus
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="bg-background-tertiary border border-border-subtle rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-pl-green"
                  />
                )}
                <button onClick={handleSave} className="text-pl-green bg-pl-green/10 p-1.5 rounded-lg hover:bg-pl-green/20"><CheckCircle2 size={16} /></button>
                <button onClick={() => { setIsEditing(false); setTempValue(value); }} className="text-danger bg-danger/10 p-1.5 rounded-lg hover:bg-danger/20"><X size={16} /></button>
             </div>
          ) : (
             <p className="text-md font-bold text-text-secondary group-hover:text-pl-purple transition-colors">{value || "Non renseigné"}</p>
          )}
       </div>
       {!isEditing && (
         <button onClick={() => setIsEditing(true)} className="p-2 h-9 w-9 rounded-xl border border-border-subtle flex items-center justify-center text-text-tertiary hover:text-pl-green hover:border-pl-green/50 transition-all opacity-0 group-hover:opacity-100">
           <Pencil size={14} />
         </button>
       )}
    </div>
  );
}

// --- Modal Components ---

function JerseyModal({ data, onClose, onSave }: { data: any, onClose: () => void, onSave: (data: any) => void }) {
  const [formData, setFormData] = React.useState(data);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
       <motion.div 
         initial={{ y: 50, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         className="w-full max-w-4xl bg-[#0A0A0F] rounded-[40px] border border-white/10 p-8 md:p-12 relative"
       >
          <button onClick={onClose} className="absolute top-8 right-8 text-text-muted hover:text-white"><X size={24} /></button>
          
          <div className="flex flex-col md:flex-row gap-12 items-center">
             <div className="w-full md:w-1/2">
                <JerseyPreview 
                  color={formData.jerseyColor}
                  name={formData.jerseyName}
                  number={formData.jerseyNumber}
                  size="lg"
                />
             </div>
             
             <div className="w-full md:w-1/2 space-y-8">
                <div className="space-y-2">
                   <h2 className="text-3xl font-display font-black uppercase text-white">Personnalisation</h2>
                   <p className="text-text-tertiary text-sm italic">Mets à jour ton style sur le terrain.</p>
                </div>

                <div className="space-y-6">
                   <div className="flex gap-4">
                      {['red', 'blue'].map((c: any) => (
                        <button 
                          key={c}
                          onClick={() => setFormData({ ...formData, jerseyColor: c })}
                          className={cn(
                            "flex-1 h-12 rounded-xl border-2 flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest",
                            formData.jerseyColor === c ? "border-pl-green bg-pl-green/10 text-pl-green" : "border-white/5 text-text-muted"
                          )}
                        >
                           <div className={cn("w-3 h-3 rounded-full", c === 'red' ? 'bg-red-600' : 'bg-blue-600')} /> {c === 'red' ? 'Rouge' : 'Bleu'}
                        </button>
                      ))}
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Nom sur le maillot</label>
                      <input 
                        type="text"
                        maxLength={12}
                        value={formData.jerseyName}
                        onChange={(e) => setFormData({ ...formData, jerseyName: e.target.value.toUpperCase() })}
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-display font-black text-xl uppercase focus:border-pl-green outline-none"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Numéro</label>
                      <div className="flex items-center gap-4">
                         <button onClick={() => setFormData({...formData, jerseyNumber: Math.max(1, formData.jerseyNumber - 1)})} className="h-14 w-14 rounded-xl bg-white/5 flex items-center justify-center text-white"><Minus size={18} /></button>
                         <div className="flex-1 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center font-display font-black text-2xl text-white">{formData.jerseyNumber}</div>
                         <button onClick={() => setFormData({...formData, jerseyNumber: Math.min(99, formData.jerseyNumber + 1)})} className="h-14 w-14 rounded-xl bg-white/5 flex items-center justify-center text-white"><Plus size={18} /></button>
                      </div>
                   </div>
                </div>

                <Button fullWidth onClick={() => onSave(formData)} className="bg-pl-green text-black font-black uppercase">Enregistrer les modifications</Button>
             </div>
          </div>
       </motion.div>
    </div>
  );
}

function ReviewModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (rating: number, comment: string) => void }) {
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [hoverRating, setHoverRating] = React.useState(0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
       <motion.div 
         initial={{ scale: 0.9, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         className="w-full max-w-md bg-background-card rounded-[32px] border border-border-subtle p-8 space-y-8"
       >
          <div className="text-center space-y-4">
             <div className="w-20 h-20 bg-accent-green/10 rounded-3xl flex items-center justify-center text-accent-green mx-auto">
                <Star size={40} className="fill-accent-green" />
             </div>
             <h3 className="text-3xl font-display font-black uppercase text-white">Laisse ton avis</h3>
             <p className="text-text-tertiary text-sm">Comment s'est passé ton match sur ce terrain ?</p>
          </div>

          <div className="space-y-6">
             <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button 
                    key={s} 
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(s)}
                    className="p-1 transition-transform active:scale-95"
                  >
                    <Star 
                      size={40} 
                      className={cn(
                        "transition-colors",
                        (hoverRating || rating) >= s ? "fill-pl-green text-pl-green" : "text-border-subtle"
                      )} 
                    />
                  </button>
                ))}
             </div>

             <textarea 
               placeholder="Commentaire (optionnel)..."
               value={comment}
               onChange={(e) => setComment(e.target.value)}
               className="w-full bg-background-secondary border border-border-subtle rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-pl-green h-32 resize-none"
             />
          </div>

          <div className="flex gap-4">
             <Button variant="outline" fullWidth onClick={onClose}>Annuler</Button>
             <Button 
               fullWidth 
               className="bg-pl-green text-black"
               disabled={rating === 0}
               onClick={() => onSubmit(rating, comment)}
             >
               Publier l'avis
             </Button>
          </div>
       </motion.div>
    </div>
  );
}
