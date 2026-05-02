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

const MatchTicket = ({ match, type }: { match: any, type: 'upcoming' | 'history' }) => {
  return (
    <div className={cn(
      "group relative overflow-hidden bg-background-card border border-border-subtle rounded-2xl transition-all hover:border-accent-green/30",
      type === 'history' && "opacity-70 grayscale-[0.3]"
    )}>
      <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-background-primary z-10 border-r border-border-subtle" />
      <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-background-primary z-10 border-l border-border-subtle" />
      
      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 relative">
         <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
               <Badge className={cn("font-black text-[10px] uppercase h-6 px-3", type === 'upcoming' ? 'bg-accent-green/10 text-accent-green' : 'bg-background-secondary text-text-tertiary')}>
                 {type === 'upcoming' ? 'À venir' : 'Terminé'}
               </Badge>
               <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">{match.id}</span>
            </div>
            
            <div className="space-y-1">
               <h3 className="text-xl md:text-2xl font-display font-black uppercase tracking-tight leading-none">{match.terrain}</h3>
               <div className="flex items-center gap-2 text-text-secondary text-xs">
                  <MapPin size={14} className="text-accent-green" />
                  {match.location}
               </div>
            </div>
         </div>

         <div className="h-px md:h-20 w-full md:w-px bg-border-subtle border-dashed md:border-l" />

         <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center md:min-w-[120px] gap-2">
            <div className="flex flex-col items-center md:items-end">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">MER 22 MAI</span>
               <span className="text-2xl font-display font-black leading-none text-accent-green">19:00</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest border border-border-subtle px-3 py-1 rounded-full">
               <Users size={12} strokeWidth={2.5} /> {match.players}
            </div>
         </div>
      </div>
      
      <div className="bg-background-secondary/50 px-8 py-3 border-t border-border-subtle flex items-center justify-between">
         {type === 'upcoming' ? (
           <button className="text-[10px] font-black uppercase tracking-widest text-accent-green hover:underline">Voir le match →</button>
         ) : (
           <button className="text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-white flex items-center gap-2 group/avis">
              <Star size={14} className="group-hover/avis:text-accent-green transition-colors" /> Laisser un avis
           </button>
         )}
         <button className="text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-danger">Partager</button>
      </div>
    </div>
  );
};

export default function Profile() {
  const [activeTab, setActiveTab] = React.useState<'matchs' | 'favoris' | 'config'>('matchs');
  const [matchTab, setMatchTab] = React.useState<'avenir' | 'histo'>('avenir');
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const [smsEnabled, setSmsEnabled] = React.useState(false);

  return (
    <div className="min-h-screen bg-background-primary pt-32 pb-32">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center space-y-6 mb-16">
           <div className="relative group">
              {/* Rotating Border */}
              <div className="absolute inset-[-6px] rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#22C55E_0deg,#22C55E_120deg,transparent_121deg,transparent_360deg)] animate-[spin_4s_linear_infinite]" />
                <div className="absolute inset-[2px] bg-background-primary rounded-full group-hover:scale-[1.02] transition-transform" />
              </div>
              
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full relative z-10 p-2 overflow-hidden bg-background-card">
                 <div className="w-full h-full rounded-full bg-purple-500 flex items-center justify-center text-3xl md:text-5xl font-display font-black text-white uppercase select-none">
                    AS
                 </div>
              </div>
              
              <button className="absolute bottom-2 right-2 z-20 w-8 h-8 rounded-full bg-background-card border border-border-subtle flex items-center justify-center text-text-tertiary hover:text-accent-green hover:scale-110 transition-all shadow-xl">
                 <Camera size={16} />
              </button>
           </div>

           <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight">Ahmed Skander</h1>
              <div className="flex items-center justify-center gap-2 text-text-secondary text-sm font-medium">
                 <MapPin size={16} className="text-accent-green" /> Tunis, Ariana
                 <span className="w-1.5 h-1.5 rounded-full bg-border-subtle" />
                 <Badge className="bg-accent-green/10 text-accent-green border-accent-green/20 uppercase font-black text-[9px] tracking-widest h-6">Organisateur</Badge>
              </div>
           </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-16 px-2 md:px-0">
           {[
             { label: "Matches Joués", count: 24, icon: Trophy, color: "text-accent-green" },
             { label: "Organisés", count: 6, icon: Users, color: "text-white" },
             { label: "Terrains", count: 12, icon: MapPin, color: "text-text-tertiary" }
           ].map((stat, i) => (
             <Card key={i} className="p-4 md:p-6 text-center space-y-2 group overflow-hidden border-border-subtle relative">
                <div className="absolute inset-0 bg-accent-green/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
                <stat.icon size={20} className="mx-auto text-text-tertiary group-hover:text-accent-green transition-colors" />
                <div className="space-y-0.5 relative">
                   <p className={cn("text-2xl md:text-4xl font-display font-black leading-none", stat.color)}>
                     <Counter target={stat.count} />
                   </p>
                   <p className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-text-tertiary">{stat.label}</p>
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
                    activeTab === tab.id ? "bg-accent-green text-black shadow-lg" : "text-text-tertiary hover:text-white"
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
                        matchTab === 'avenir' ? "text-accent-green" : "text-text-tertiary hover:text-text-secondary"
                      )}
                    >
                      À venir
                      {matchTab === 'avenir' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-1 bg-accent-green rounded-t-full" />}
                    </button>
                    <button 
                      onClick={() => setMatchTab('histo')}
                      className={cn(
                        "pb-4 px-2 font-display font-bold uppercase text-lg tracking-tight relative",
                        matchTab === 'histo' ? "text-accent-green" : "text-text-tertiary hover:text-text-secondary"
                      )}
                    >
                      Historique
                      {matchTab === 'histo' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-1 bg-accent-green rounded-t-full" />}
                    </button>
                 </div>

                 <div className="grid gap-6">
                    {matchTab === 'avenir' ? (
                       <>
                         <MatchTicket type="upcoming" match={{ id: 'TKW-9821', terrain: 'Foot Center Gammarth', location: 'Gammarth, Tunis', players: '12/14' }} />
                         <MatchTicket type="upcoming" match={{ id: 'TKW-9825', terrain: 'Wadi Foot', location: 'Marsa, Tunis', players: '6/12' }} />
                       </>
                    ) : (
                       <>
                         <MatchTicket type="history" match={{ id: 'TKW-8012', terrain: 'Complex Sportif Ariana', location: 'Ariana', players: '14/14' }} />
                         <MatchTicket type="history" match={{ id: 'TKW-7954', terrain: 'Foot Center Gammarth', location: 'Gammarth', players: '12/12' }} />
                       </>
                    )}
                 </div>
               </motion.div>
             )}

             {activeTab === 'favoris' && (
                <motion.div 
                  key="favoris"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                   {/* This would reuse the actual terrain cards, but simplified for profile */}
                   {[1, 2].map((i) => (
                      <Card key={i} className="group overflow-hidden rounded-[24px] border-border-subtle">
                         <div className="relative aspect-[16/10] bg-background-secondary overflow-hidden">
                            <div className="absolute top-4 right-4 z-20">
                               <button className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-accent-green shadow-xl">
                                  <Heart size={20} fill="currentColor" />
                               </button>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                            <div className="absolute bottom-4 left-4 z-20 space-y-1">
                               <h4 className="text-lg font-display font-black uppercase text-white">Wadi Foot Gammarth</h4>
                               <p className="flex items-center gap-1 text-[10px] font-bold text-white/70 uppercase">
                                  <MapPin size={12} /> Gammarth, Tunis
                               </p>
                            </div>
                         </div>
                         <div className="p-4 flex items-center justify-between bg-background-card">
                            <span className="text-xl font-display font-black text-accent-green">50 DT <span className="text-[10px] text-text-tertiary">/H</span></span>
                            <Button size="sm" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest">Réserver</Button>
                         </div>
                      </Card>
                   ))}
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
                      <SettingRow icon={User} label="Nom et Prénom" value="Ahmed Skander" onEdit={() => {}} />
                      <SettingRow icon={Phone} label="Numéro de téléphone" value="+216 ** *** 821" onEdit={() => {}} />
                      <SettingRow icon={MapPin} label="Ville" value="Tunis, Ariana" onEdit={() => {}} />
                      <SettingRow icon={Globe} label="Langue" value="Français / العربية" onEdit={() => {}} isToggle />
                   </Card>

                   <Card className="divide-y divide-border-subtle bg-background-card overflow-hidden">
                      <div className="px-6 py-5 flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center text-text-tertiary group-hover:text-accent-green transition-colors">
                               <Bell size={20} />
                            </div>
                            <div className="space-y-0.5">
                               <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Notifications Push</p>
                               <p className="text-xs font-bold">Inscriptions, matchs, alertes</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => setPushEnabled(!pushEnabled)}
                           className={cn(
                             "w-12 h-6 rounded-full relative transition-colors duration-300",
                             pushEnabled ? "bg-accent-green" : "bg-background-secondary border border-border-subtle"
                           )}
                         >
                            <motion.div 
                              animate={{ x: pushEnabled ? 26 : 4 }}
                              className={cn("absolute top-1 w-4 h-4 rounded-full shadow-md", pushEnabled ? "bg-black" : "bg-text-tertiary")} 
                            />
                         </button>
                      </div>

                      <div className="px-6 py-5 flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center text-text-tertiary group-hover:text-accent-green transition-colors">
                               <CheckCircle2 size={20} />
                            </div>
                            <div className="space-y-0.5">
                               <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Notifications SMS</p>
                               <p className="text-xs font-bold">Important uniquement</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => setSmsEnabled(!smsEnabled)}
                           className={cn(
                             "w-12 h-6 rounded-full relative transition-colors duration-300",
                             smsEnabled ? "bg-accent-green" : "bg-background-secondary border border-border-subtle"
                           )}
                         >
                            <motion.div 
                              animate={{ x: smsEnabled ? 26 : 4 }}
                              className={cn("absolute top-1 w-4 h-4 rounded-full shadow-md", smsEnabled ? "bg-black" : "bg-text-tertiary")} 
                            />
                         </button>
                      </div>
                   </Card>

                   <div className="space-y-3">
                      <button className="w-full flex items-center justify-between px-6 py-4 bg-background-secondary/30 rounded-2xl group border border-transparent hover:border-border-subtle transition-all">
                         <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Politique de confidentialité</span>
                         <ExternalLink size={16} className="text-text-tertiary group-hover:text-white transition-colors" />
                      </button>
                      <button className="w-full flex items-center justify-between px-6 py-4 bg-background-secondary/30 rounded-2xl group border border-transparent hover:border-border-subtle transition-all">
                         <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Conditions d'utilisation</span>
                         <ExternalLink size={14} className="text-text-tertiary group-hover:text-white transition-colors" />
                      </button>
                   </div>

                   <div className="pt-8 space-y-4">
                      <Button variant="outline" className="w-full h-14 border-danger/30 text-danger hover:bg-danger-hover hover:text-white gap-3 font-black uppercase tracking-widest text-xs">
                         <LogOut size={18} /> Se déconnecter
                      </Button>
                      <button className="w-full text-center text-text-tertiary text-[10px] font-black uppercase tracking-[0.2em] hover:text-danger hover:underline">
                         Supprimer mon compte
                      </button>
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
          <div className="w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center text-text-tertiary group-hover:text-accent-green transition-colors">
             <Icon size={20} />
          </div>
          <div className="space-y-0.5">
             <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{label}</p>
             <p className="text-sm font-bold text-text-secondary group-hover:text-white transition-colors">{value}</p>
          </div>
       </div>
       <button onClick={onEdit} className="text-accent-green hover:underline font-black text-[10px] uppercase tracking-widest">
          {isToggle ? 'Changer' : 'Modifier'}
       </button>
    </div>
  );
}
