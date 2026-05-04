import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  MapPin, 
  Trophy, 
  History, 
  Settings, 
  Heart, 
  ChevronRight, 
  LogOut, 
  Trash2, 
  User, 
  Phone, 
  Bell, 
  Globe, 
  ExternalLink,
  Star,
  Users,
  Calendar,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { cn } from '@/src/lib/utils';

// --- Mock Components ---
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

const MatchTicket: React.FC<{ match: any, type: 'upcoming' | 'history' }> = ({ match, type }) => {
  return (
    <div className={cn(
      "group relative overflow-hidden bg-background-card border border-border-subtle rounded-2xl transition-all hover:border-pl-green/30",
      type === 'history' && "opacity-70 grayscale-[0.3]"
    )}>
      <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-background-primary z-10 border-r border-border-subtle" />
      <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-background-primary z-10 border-l border-border-subtle" />
      
      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 relative">
         <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
               <Badge className={cn("font-black text-[10px] uppercase h-6 px-3", type === 'upcoming' ? 'bg-pl-green/10 text-pl-green' : 'bg-background-secondary text-text-tertiary')}>
                 {type === 'upcoming' ? 'À venir' : 'Terminé'}
               </Badge>
               <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">{match.id}</span>
            </div>
            
            <div className="space-y-1">
               <h3 className="text-xl md:text-2xl font-display font-black uppercase tracking-tight leading-none">{match.terrain}</h3>
               <div className="flex items-center gap-2 text-text-secondary text-xs">
                  <MapPin size={14} className="text-pl-green" />
                  {match.location}
               </div>
            </div>
         </div>

         <div className="h-px md:h-20 w-full md:w-px bg-border-subtle border-dashed md:border-l" />

         <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center md:min-w-[120px] gap-2">
            <div className="flex flex-col items-center md:items-end">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">MER 22 MAI</span>
               <span className="text-2xl font-display font-black leading-none text-pl-green">19:00</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest border border-border-subtle px-3 py-1 rounded-full">
               <Users size={12} strokeWidth={2.5} /> {match.players}
            </div>
         </div>
      </div>
      
      <div className="bg-background-secondary/50 px-8 py-3 border-t border-border-subtle flex items-center justify-between">
         {type === 'upcoming' ? (
           <button className="text-[10px] font-black uppercase tracking-widest text-pl-green hover:underline">Voir le match →</button>
         ) : (
           <button className="text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-white flex items-center gap-2 group/avis">
              <Star size={14} className="group-hover/avis:text-pl-green transition-colors" /> Laisser un avis
           </button>
         )}
         <button className="text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-danger">Partager</button>
      </div>
    </div>
  );
};

import { useAuth } from '@/src/contexts/AuthContext';
import { useReservations } from '@/src/hooks/useReservations';
import { useCookie } from '@/src/contexts/CookieContext';
import { db, auth as firebaseAuth } from '@/src/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function Profile() {
  const { user, userProfile, signOut } = useAuth();
  const { consent, resetConsent, canTrackAnalytics, canTrackAdvertising } = useCookie();
  const [activeTab, setActiveTab] = React.useState<'matchs' | 'favoris' | 'config'>('matchs');
  const [matchTab, setMatchTab] = React.useState<'avenir' | 'histo'>('avenir');
  const [showCookieModal, setShowCookieModal] = React.useState(false);
  
  const { reservations, isLoading: reservationsLoading } = useReservations({ 
    organizerId: user?.uid 
  });

  const upcomingMatches = reservations.filter(r => r.status !== 'cancelled' && new Date(r.date) >= new Date());
  const pastMatches = reservations.filter(r => r.status === 'cancelled' || new Date(r.date) < new Date());

  const handleUpdateProfile = async (field: string, value: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { [field]: value });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (!user || !userProfile) return null;

  return (
    <div className="flex-grow bg-background-primary pt-32 pb-32">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center space-y-6 mb-16">
           <div className="relative group">
              {/* Rotating Border */}
              <div className="absolute inset-[-6px] rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#00FF85_0deg,#00FF85_120deg,transparent_121deg,transparent_360deg)] animate-[spin_4s_linear_infinite]" />
                <div className="absolute inset-[2px] bg-background-primary rounded-full group-hover:scale-[1.02] transition-transform" />
              </div>
              
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full relative z-10 p-2 overflow-hidden bg-background-card">
                 {userProfile.avatarUrl ? (
                   <img src={userProfile.avatarUrl} className="w-full h-full rounded-full object-cover" alt={userProfile.name} />
                 ) : (
                   <div 
                      className="w-full h-full rounded-full flex items-center justify-center text-3xl md:text-5xl font-display font-black text-white uppercase select-none"
                      style={{ backgroundColor: userProfile.avatarColor || 'var(--color-pl-purple)' }}
                   >
                      {userProfile.firstName && userProfile.lastName 
                         ? `${userProfile.firstName[0]}${userProfile.lastName[0]}`
                         : userProfile.name.charAt(0)}
                   </div>
                 )}
              </div>
              
              <button className="absolute bottom-2 right-2 z-20 w-8 h-8 rounded-full bg-background-card border border-border-subtle flex items-center justify-center text-text-muted hover:text-pl-green hover:scale-110 transition-all shadow-xl">
                 <Camera size={16} />
              </button>
           </div>

           <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight text-pl-purple">{userProfile.name}</h1>
              <div className="flex items-center justify-center gap-2 text-text-secondary text-sm font-medium">
                 <MapPin size={16} className="text-accent-green" /> {userProfile.city || 'Tunisie'}
                 <span className="w-1.5 h-1.5 rounded-full bg-border-subtle" />
                 <Badge className="bg-accent-green/10 text-accent-green border-accent-green/20 uppercase font-black text-[9px] tracking-widest h-6">{userProfile.role}</Badge>
              </div>
           </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-16 px-2 md:px-0">
           {[
             { label: "Matches Participés", count: reservations.length, icon: Trophy, color: "text-pl-green" },
             { label: "Villes Visités", count: 1, icon: Users, color: "text-pl-purple" },
             { label: "Terrains Favoris", count: 0, icon: MapPin, color: "text-text-muted" }
           ].map((stat, i) => (
             <Card key={i} className="p-4 md:p-6 text-center space-y-2 group overflow-hidden border-border-subtle relative">
                <div className="absolute inset-0 bg-pl-green/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
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

        {/* Tabs */}
        <div className="space-y-10">
           <div className="flex bg-background-secondary p-1 rounded-2xl border border-border-subtle sticky top-24 z-30 shadow-xl lg:w-max lg:mx-auto">
              {[
                { id: 'matchs', label: 'Mes Matchs', icon: Trophy },
                { id: 'favoris', label: 'Terrains Favoris', icon: Heart },
                { id: 'config', label: 'Paramètres', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 md:flex-none md:min-w-[140px] h-12 flex items-center justify-center gap-2 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest",
                    activeTab === tab.id ? "bg-pl-green text-black shadow-lg" : "text-text-muted hover:text-pl-purple"
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
                    {reservationsLoading ? (
                      Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-32 bg-background-card rounded-2xl animate-pulse border border-border-subtle" />
                      ))
                    ) : (matchTab === 'avenir' ? upcomingMatches : pastMatches).length === 0 ? (
                      <div className="py-20 text-center space-y-4">
                        <Trophy size={48} className="mx-auto text-text-tertiary" />
                        <h3 className="text-xl font-display font-black uppercase text-pl-purple">Aucun match trouvé</h3>
                      </div>
                    ) : (matchTab === 'avenir' ? upcomingMatches : pastMatches).map(res => (
                      <MatchTicket key={res.id} type={matchTab === 'avenir' ? 'upcoming' : 'history'} match={{ id: res.id, terrain: res.organizerName, location: res.date, players: 'N/A' }} />
                    ))}
                 </div>
               </motion.div>
             )}

             {activeTab === 'favoris' && (
                <motion.div 
                  key="favoris"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="py-20 text-center space-y-4"
                >
                   <Heart size={48} className="mx-auto text-text-tertiary" />
                   <h3 className="text-xl font-display font-black uppercase text-pl-purple">Aucun favori</h3>
                   <p className="text-text-tertiary">Ajoutez des terrains à vos favoris pour les retrouver ici.</p>
                </motion.div>
             )}

             {activeTab === 'config' && (
                <motion.div 
                  key="config"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                   <Card className="divide-y divide-border-subtle bg-background-card overflow-hidden">
                      <SettingRow 
                        icon={User} 
                        label="Nom et Prénom" 
                        value={userProfile.name} 
                        onEdit={() => {
                          const newName = prompt("Nouveau nom:", userProfile.name);
                          if (newName) handleUpdateProfile('name', newName);
                        }} 
                      />
                      <SettingRow icon={Phone} label="Numéro de téléphone" value={userProfile.phone} onEdit={() => {}} />
                      <SettingRow 
                        icon={MapPin} 
                        label="Ville" 
                        value={userProfile.city || 'Non renseigné'} 
                        onEdit={() => {
                          const newCity = prompt("Nouvelle ville:", userProfile.city);
                          if (newCity) handleUpdateProfile('city', newCity);
                        }} 
                      />
                   </Card>

                   <div className="pt-12 space-y-6">
                      <h3 className="text-xl font-display font-black uppercase tracking-tight text-pl-purple flex items-center gap-3">
                         <Globe size={20} className="text-accent-green" /> Gestion des Cookies
                      </h3>
                      
                      <Card className="divide-y divide-border-subtle bg-background-card overflow-hidden">
                         <div className="px-6 py-4 flex items-center justify-between">
                            <div className="space-y-0.5">
                               <p className="text-xs font-bold text-pl-purple">Cookies Essentiels</p>
                               <p className="text-[10px] text-text-tertiary">Session, Sécurité, Authentification</p>
                            </div>
                            <Badge className="bg-background-secondary text-text-tertiary border-none uppercase font-black text-[8px] tracking-widest h-5">Toujours actif</Badge>
                         </div>
                         <div className="px-6 py-4 flex items-center justify-between">
                            <div className="space-y-0.5">
                               <p className="text-xs font-bold text-pl-purple">Cookies Analytiques</p>
                               <p className="text-[10px] text-text-tertiary">Fréquentation, vues d'articles</p>
                            </div>
                            <Badge className={cn(
                               "border-none uppercase font-black text-[8px] tracking-widest h-5",
                               canTrackAnalytics ? "bg-accent-green/10 text-accent-green" : "bg-danger/10 text-danger"
                            )}>
                               {canTrackAnalytics ? 'Activé' : 'Désactivé'}
                            </Badge>
                         </div>
                         <div className="px-6 py-4 flex items-center justify-between">
                            <div className="space-y-0.5">
                               <p className="text-xs font-bold text-pl-purple">Cookies Publicitaires</p>
                               <p className="text-[10px] text-text-tertiary">Performance des annonces, clics</p>
                            </div>
                            <Badge className={cn(
                               "border-none uppercase font-black text-[8px] tracking-widest h-5",
                               canTrackAdvertising ? "bg-accent-green/10 text-accent-green" : "bg-danger/10 text-danger"
                            )}>
                               {canTrackAdvertising ? 'Activé' : 'Désactivé'}
                            </Badge>
                         </div>
                      </Card>

                      <div className="flex flex-col sm:flex-row gap-4">
                         <Button 
                           variant="outline" 
                           fullWidth
                           onClick={() => resetConsent()}
                           className="h-14 border-border-subtle text-text-primary gap-3 font-black uppercase tracking-widest text-xs"
                         >
                            Modifier mes préférences
                         </Button>
                         <Button 
                           variant="outline" 
                           fullWidth
                           onClick={() => {
                             if (window.confirm("Êtes-vous sûr de vouloir retirer votre consentement ? La bannière de cookies réapparaîtra au prochain chargement.")) {
                               resetConsent();
                             }
                           }}
                           className="h-14 border-danger/30 text-danger hover:bg-danger hover:text-white gap-3 font-black uppercase tracking-widest text-xs"
                         >
                            Retirer mon consentement
                         </Button>
                      </div>
                   </div>

                   <div className="pt-8 space-y-4">
                      <Button 
                        variant="outline" 
                        onClick={() => signOut()}
                        className="w-full h-14 border-danger/30 text-danger hover:bg-danger-hover hover:text-white gap-3 font-black uppercase tracking-widest text-xs"
                      >
                         <LogOut size={18} /> Se déconnecter
                      </Button>
                   </div>
                </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, label, value, onEdit, isToggle }: any) {
  return (
    <div className="px-6 py-5 flex items-center justify-between group">
       <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center text-text-muted group-hover:text-pl-green transition-colors">
             <Icon size={20} />
          </div>
          <div className="space-y-0.5">
             <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{label}</p>
             <p className="text-sm font-bold text-text-secondary group-hover:text-pl-purple transition-colors">{value}</p>
          </div>
       </div>
       <button onClick={onEdit} className="text-pl-green hover:underline font-black text-[10px] uppercase tracking-widest">
          {isToggle ? 'Changer' : 'Modifier'}
       </button>
    </div>
  );
}
