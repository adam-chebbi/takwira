import * as React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Shuffle, 
  Trash2, 
  UserMinus, 
  CheckCircle2, 
  Clock, 
  Eye, 
  EyeOff, 
  MoreVertical, 
  RotateCcw, 
  Share2, 
  Copy, 
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  X,
  MapPin,
  Check
} from 'lucide-react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { cn } from '@/src/lib/utils';

// --- Types ---
interface Player {
  id: string;
  name: string;
  phone?: string;
  status: 'confirmed' | 'absent' | 'pending';
  team?: 'A' | 'B';
}

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

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// --- Sortable Item Component ---
interface SortablePlayerChipProps {
  player: Player;
  isDragging?: boolean;
  key?: string | number;
}

function SortablePlayerChip({ player, isDragging }: SortablePlayerChipProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: player.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center gap-3 p-3 bg-background-card rounded-2xl border border-border-subtle cursor-grab active:cursor-grabbing group transition-all",
        isDragging ? "opacity-50 scale-95" : "hover:border-accent-green/30"
      )}
    >
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0", getAvatarColor(player.name))}>
        {getInitials(player.name)}
      </div>
      <span className="font-bold uppercase tracking-wider text-xs truncate">{player.name}</span>
    </div>
  );
}

export default function MatchManage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'players' | 'teams'>('players');
  const [teamMode, setTeamMode] = React.useState<'random' | 'manual'>('random');
  const [players, setPlayers] = React.useState<Player[]>([
    { id: '1', name: 'Ahmed', phone: '55123456', status: 'confirmed' },
    { id: '2', name: 'Sami', phone: '22987654', status: 'confirmed' },
    { id: '3', name: 'Yassine', phone: '98456123', status: 'confirmed' },
    { id: '4', name: 'Mehdi', phone: '44112233', status: 'confirmed' },
    { id: '5', name: 'Karim', phone: '21009988', status: 'confirmed' },
    { id: '6', name: 'Omar', status: 'confirmed' },
    { id: '7', name: 'Skander', status: 'confirmed' },
    { id: '8', name: 'Adel', status: 'confirmed' },
  ]);
  const [isAddingPlayer, setIsAddingPlayer] = React.useState(false);
  const [newPlayerName, setNewPlayerName] = React.useState('');
  const [newPlayerPhone, setNewPlayerPhone] = React.useState('');
  const [isShuffling, setIsShuffling] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [cancelConfirmText, setCancelConfirmText] = React.useState('');
  const [phoneVisibility, setPhoneVisibility] = React.useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // Auth Guard Simulation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // Simulation: Ahmed S. is the organizer. In a real app we check the token.
      setIsCheckingAuth(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const togglePhoneVisibility = (id: string) => {
    setPhoneVisibility(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const removePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const cycleStatus = (id: string) => {
    setPlayers(prev => prev.map(p => {
      if (p.id !== id) return p;
      const statusMap: Record<string, 'confirmed' | 'absent' | 'pending'> = {
        'confirmed': 'absent',
        'absent': 'pending',
        'pending': 'confirmed'
      };
      return { ...p, status: statusMap[p.status] };
    }));
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPlayerName,
      phone: newPlayerPhone,
      status: 'confirmed'
    };
    setPlayers(prev => [newPlayer, ...prev]);
    setNewPlayerName('');
    setNewPlayerPhone('');
    setIsAddingPlayer(false);
  };

  const handleRandomizeTeams = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      const newPlayers = players.map(p => {
        const index = shuffled.findIndex(s => s.id === p.id);
        return { ...p, team: index < shuffled.length / 2 ? 'A' : 'B' } as Player;
      });
      setPlayers(newPlayers);
      setIsShuffling(false);
    }, 1500);
  };

  // DND Handlers
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Logic to handle moving across containers if using Multiple containers
    // For simplicity here, we define three lists
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if over container
    if (overId === 'teamA') {
      setPlayers(prev => prev.map(p => p.id === activeId ? { ...p, team: 'A' } as Player : p));
    } else if (overId === 'teamB') {
      setPlayers(prev => prev.map(p => p.id === activeId ? { ...p, team: 'B' } as Player : p));
    } else if (overId === 'unassigned') {
      setPlayers(prev => prev.map(p => p.id === activeId ? { ...p, team: undefined } : p));
    }
  };

  const autoBalance = () => {
    const unassigned = players.filter(p => !p.team);
    const teamA = players.filter(p => p.team === 'A');
    const teamB = players.filter(p => p.team === 'B');

    let newPlayers = [...players];
    unassigned.forEach((p, i) => {
      const targetTeam = (teamA.length + i) <= (teamB.length + (unassigned.length - i - 1)) ? 'A' : 'B';
      newPlayers = newPlayers.map(np => np.id === p.id ? { ...np, team: targetTeam as 'A' | 'B' } : np);
    });
    setPlayers(newPlayers);
  };

  const resetTeams = () => {
    setPlayers(prev => prev.map(p => ({ ...p, team: undefined })));
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-background-primary px-4">
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse text-center">
          <div className="h-12 w-64 bg-background-secondary rounded-full mx-auto" />
          <div className="h-4 w-48 bg-background-secondary rounded-full mx-auto" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-background-secondary rounded-2xl" />
            <div className="h-24 bg-background-secondary rounded-2xl" />
            <div className="h-24 bg-background-secondary rounded-2xl" />
          </div>
          <div className="h-96 bg-background-secondary rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-32 bg-background-primary overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight leading-none text-text-primary">
              Gérer <span className="text-accent-green">le Match</span>
            </h1>
            <p className="text-text-secondary font-medium uppercase tracking-widest text-xs">
              {MOCK_MATCH_DATA.name} · {MOCK_MATCH_DATA.complex}
            </p>
          </div>
          <Link 
            to={`/match/${token}`} 
            target="_blank"
            className="flex items-center gap-2 text-accent-green font-bold text-xs uppercase tracking-widest hover:underline group"
          >
            Voir la page publique <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { label: "Joueurs inscrits", val: players.length, color: "text-accent-green" },
            { label: "Places restantes", val: 12 - players.length, color: "text-text-primary" },
            { label: "Statut terrain", val: "CONFIRMÉ", color: "text-accent-green", isBadge: true }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 bg-background-card border-t-2 border-accent-green relative overflow-hidden group">
                <div className="absolute inset-0 bg-accent-green/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="space-y-1 relative">
                   <p className="text-[10px] uppercase font-black tracking-widest text-text-tertiary">{stat.label}</p>
                   {stat.isBadge ? (
                     <Badge className="bg-accent-green/10 text-accent-green border-accent-green/20 font-black h-8 px-4 mt-2">
                       {stat.val}
                     </Badge>
                   ) : (
                     <p className={cn("text-4xl font-display font-black leading-none pt-2", stat.color)}>{stat.val}</p>
                   )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Player Management Section */}
        <section className="space-y-8 mb-20">
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
             <h2 className="text-2xl font-display font-black uppercase tracking-tight">Liste des joueurs</h2>
             <Button 
                onClick={() => setIsAddingPlayer(true)}
                variant="outline" 
                size="sm" 
                className="gap-2 border-accent-green/30 text-accent-green hover:bg-accent-green hover:text-black font-bold h-10 px-6"
             >
               <UserPlus size={18} /> Ajouter <span className="hidden md:inline">manuellement</span>
             </Button>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {players.map((player) => (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                >
                  <Card className={cn(
                    "p-4 flex items-center justify-between group relative overflow-hidden transition-all duration-300",
                    player.status === 'absent' && "opacity-40"
                  )}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn(
                         "w-12 h-12 rounded-full flex items-center justify-center text-white font-display font-bold border-2 border-white/5",
                         getAvatarColor(player.name)
                      )}>
                        {getInitials(player.name)}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold uppercase tracking-wider text-sm">{player.name}</h4>
                        {player.phone && (
                          <div className="flex items-center gap-2 text-[10px] font-sans font-bold text-text-secondary">
                             <span className="tracking-[0.2em]">
                               {phoneVisibility[player.id] ? `+216 ${player.phone}` : "+216 **** ****"}
                             </span>
                             <button onClick={() => togglePhoneVisibility(player.id)} className="hover:text-accent-green">
                               {phoneVisibility[player.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                             </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="cursor-pointer" onClick={() => cycleStatus(player.id)}>
                        <Badge 
                          className={cn(
                            "h-8 px-4 font-black uppercase tracking-widest text-[9px] select-none pointer-events-none",
                            player.status === 'confirmed' ? "bg-accent-green/10 text-accent-green border-accent-green/20" :
                            player.status === 'absent' ? "bg-danger/10 text-danger border-danger/20" :
                            "bg-warning/10 text-warning border-warning/20"
                          )}
                        >
                          {player.status === 'confirmed' ? 'Confirmé' : player.status === 'absent' ? 'Absent' : 'En attente'}
                        </Badge>
                      </div>

                      <div className="relative group/menu">
                        <Button variant="outline" size="sm" className="h-10 w-10 p-0 text-text-tertiary">
                          <MoreVertical size={18} />
                        </Button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-background-card border border-border-subtle rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 overflow-hidden">
                           <button 
                             onClick={() => cycleStatus(player.id)}
                             className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-background-secondary flex items-center gap-2"
                           >
                              <CheckCircle2 size={14} className="text-accent-green" /> Changer statut
                           </button>
                           <button 
                             onClick={() => removePlayer(player.id)}
                             className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-danger/10 text-danger flex items-center gap-2"
                           >
                              <Trash2 size={14} /> Retirer du match
                           </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {players.length === 0 && (
              <div className="py-12 flex flex-col items-center text-center space-y-4">
                 <div className="w-16 h-16 rounded-full bg-background-secondary border border-border-subtle flex items-center justify-center text-text-tertiary">
                    <Users size={32} />
                 </div>
                 <p className="text-sm font-bold uppercase text-text-tertiary tracking-widest">Aucun joueur pour le moment</p>
              </div>
            )}
          </div>
        </section>

        {/* Team Builder Section */}
        <section className="space-y-8 mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
             <h2 className="text-3xl font-display font-black uppercase tracking-tight">Constitution des Équipes</h2>
             <div className="flex bg-background-secondary p-1 rounded-xl border border-border-subtle h-12">
                <button 
                  onClick={() => setTeamMode('random')}
                  className={cn(
                    "flex-1 px-6 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all",
                    teamMode === 'random' ? "bg-accent-green text-black shadow-lg" : "text-text-tertiary hover:text-text-primary"
                  )}
                >
                  Mode Aléatoire
                </button>
                <button 
                   onClick={() => setTeamMode('manual')}
                   className={cn(
                    "flex-1 px-6 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all",
                    teamMode === 'manual' ? "bg-accent-green text-black shadow-lg" : "text-text-tertiary hover:text-text-primary"
                  )}
                >
                  Mode Manuel
                </button>
             </div>
          </div>

          <div className="bg-background-card rounded-[32px] border border-border-subtle p-8 md:p-12 relative overflow-hidden min-h-[500px]">
             {/* Decorative grid bg */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(circle, #22C55E 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

             <AnimatePresence mode="wait">
               {teamMode === 'random' ? (
                 <motion.div 
                    key="random"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center relative z-10"
                 >
                    {isShuffling ? (
                      <div className="flex flex-col items-center py-20">
                         <div className="relative w-48 h-48">
                            {players.map((p, i) => (
                              <motion.div
                                key={p.id}
                                className={cn("absolute w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center text-[8px] font-black", getAvatarColor(p.name))}
                                initial={{ top: '50%', left: '50%' }}
                                animate={{ 
                                  top: `${50 + Math.sin(i * 137) * 40}%`, 
                                  left: `${50 + Math.cos(i * 137) * 40}%`,
                                  rotate: [0, 360 * 3]
                                }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                              >
                                {getInitials(p.name)}
                              </motion.div>
                            ))}
                         </div>
                         <p className="mt-8 text-xl font-display font-black uppercase tracking-tight text-accent-green animate-pulse">Brassage en cours...</p>
                      </div>
                    ) : players.some(p => p.team) ? (
                      <div className="w-full space-y-12">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                               <Badge className="bg-accent-green text-black font-black uppercase tracking-[0.3em] w-full justify-center h-12 text-sm shadow-[0_0_20px_rgba(34,197,94,0.3)]">Équipe A ({players.filter(p => p.team === 'A').length})</Badge>
                               <div className="space-y-2">
                                  {players.filter(p => p.team === 'A').map((p, i) => (
                                    <motion.div 
                                      key={p.id} 
                                      initial={{ x: -20, opacity: 0 }} 
                                      animate={{ x: 0, opacity: 1 }}
                                      transition={{ delay: i * 0.05 }}
                                      className="flex items-center gap-3 p-3 bg-background-primary/50 rounded-2xl border border-border-subtle"
                                    >
                                       <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black", getAvatarColor(p.name))}>
                                         {getInitials(p.name)}
                                       </div>
                                       <span className="font-bold uppercase tracking-wider text-xs">{p.name}</span>
                                    </motion.div>
                                  ))}
                               </div>
                            </div>
                            <div className="space-y-6">
                               <Badge className="bg-background-secondary text-text-secondary border border-border-subtle font-black uppercase tracking-[0.3em] w-full justify-center h-12 text-sm">Équipe B ({players.filter(p => p.team === 'B').length})</Badge>
                               <div className="space-y-2">
                                  {players.filter(p => p.team === 'B').map((p, i) => (
                                    <motion.div 
                                      key={p.id} 
                                      initial={{ x: 20, opacity: 0 }} 
                                      animate={{ x: 0, opacity: 1 }}
                                      transition={{ delay: i * 0.05 }}
                                      className="flex items-center gap-3 p-3 bg-background-primary/50 rounded-2xl border border-border-subtle"
                                    >
                                       <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black", getAvatarColor(p.name))}>
                                         {getInitials(p.name)}
                                       </div>
                                       <span className="font-bold uppercase tracking-wider text-xs">{p.name}</span>
                                    </motion.div>
                                  ))}
                               </div>
                            </div>
                         </div>
                         <div className="flex flex-col md:flex-row gap-4 pt-8">
                            <Button onClick={handleRandomizeTeams} variant="outline" className="flex-1 h-14 uppercase font-black text-xs tracking-widest gap-2">
                               <RotateCcw size={18} /> Re-mélanger
                            </Button>
                            <Button className="flex-[2] h-14 uppercase font-black text-xs tracking-widest gap-2">
                               <Check size={18} /> Valider et Publier
                            </Button>
                         </div>
                      </div>
                    ) : (
                      <div className="py-20 flex flex-col items-center space-y-8">
                         <motion.button 
                            onClick={handleRandomizeTeams}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-32 h-32 rounded-full border-4 border-accent-green flex items-center justify-center text-accent-green shadow-[0_0_40px_rgba(34,197,94,0.2)]"
                         >
                            <Shuffle size={48} />
                         </motion.button>
                         <div className="text-center space-y-2">
                            <h3 className="text-2xl font-display font-black uppercase">Générer les équipes</h3>
                            <p className="text-text-secondary text-sm max-w-xs">On brassage les joueurs pour créer deux équipes équilibrées en un clic.</p>
                         </div>
                         <Button onClick={handleRandomizeTeams} className="h-14 px-12 font-black uppercase tracking-widest">
                            Lancer le tirage au sort
                         </Button>
                      </div>
                    )}
                 </motion.div>
               ) : (
                 <motion.div 
                    key="manual"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="relative z-10 space-y-12"
                 >
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                         {/* Team A Drop Zone */}
                         <div className="space-y-6">
                            <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Équipe A</span>
                               <Badge className="bg-accent-green text-black font-black uppercase text-[10px]">{players.filter(p => p.team === 'A').length}</Badge>
                            </div>
                            <div id="teamA" className={cn(
                              "min-h-[200px] p-4 bg-background-primary/50 border-2 border-dashed rounded-[32px] transition-colors flex flex-col gap-3",
                              players.filter(p => p.team === 'A').length === 0 ? "border-border-subtle" : "border-accent-green/30"
                            )}>
                              <SortableContext items={players.filter(p => p.team === 'A').map(p => p.id)} strategy={verticalListSortingStrategy}>
                                {players.filter(p => p.team === 'A').map(p => (
                                  <SortablePlayerChip key={p.id} player={p} />
                                ))}
                              </SortableContext>
                              {players.filter(p => p.team === 'A').length === 0 && (
                                <div className="flex-1 flex items-center justify-center text-text-tertiary text-xs font-bold uppercase tracking-widest opacity-20">DÉPOSER ICI</div>
                              )}
                            </div>
                         </div>

                         {/* Team B Drop Zone */}
                         <div className="space-y-6">
                            <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Équipe B</span>
                               <Badge className="bg-background-secondary text-text-secondary border border-border-subtle font-black uppercase text-[10px]">{players.filter(p => p.team === 'B').length}</Badge>
                            </div>
                            <div id="teamB" className={cn(
                              "min-h-[200px] p-4 bg-background-primary/50 border-2 border-dashed rounded-[32px] transition-colors flex flex-col gap-3",
                              players.filter(p => p.team === 'B').length === 0 ? "border-border-subtle" : "border-white/20"
                            )}>
                              <SortableContext items={players.filter(p => p.team === 'B').map(p => p.id)} strategy={verticalListSortingStrategy}>
                                {players.filter(p => p.team === 'B').map(p => (
                                  <SortablePlayerChip key={p.id} player={p} />
                                ))}
                              </SortableContext>
                              {players.filter(p => p.team === 'B').length === 0 && (
                                <div className="flex-1 flex items-center justify-center text-text-tertiary text-xs font-bold uppercase tracking-widest opacity-20">DÉPOSER ICI</div>
                              )}
                            </div>
                         </div>
                      </div>

                      {/* Unassigned Pool */}
                      <div className="space-y-6 pt-12 border-t border-border-subtle">
                         <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-text-tertiary">Joueurs disponibles</h4>
                            <div className="flex gap-2">
                               <Button size="sm" variant="outline" onClick={autoBalance} className="h-9 px-4 text-[10px] uppercase font-black tracking-widest gap-2">
                                  <Shuffle size={12} /> Équilibrer
                               </Button>
                               <Button size="sm" variant="outline" onClick={resetTeams} className="h-9 px-4 text-[10px] uppercase font-black tracking-widest gap-2 border-danger/30 text-danger hover:bg-danger/10">
                                  Tout effacer
                               </Button>
                            </div>
                         </div>
                         <div id="unassigned" className="p-6 bg-background-secondary/30 border border-border-subtle rounded-[24px] flex flex-wrap gap-3 min-h-[100px]">
                            <SortableContext items={players.filter(p => !p.team).map(p => p.id)}>
                              {players.filter(p => !p.team).map(p => (
                                <SortablePlayerChip key={p.id} player={p} />
                              ))}
                            </SortableContext>
                         </div>
                      </div>

                      <DragOverlay dropAnimation={{
                        sideEffects: defaultDropAnimationSideEffects({
                          styles: {
                            active: {
                              opacity: '0.4',
                            },
                          },
                        }),
                      }}>
                        {activeId ? (
                          <div className="flex items-center gap-3 p-3 bg-accent-green text-black rounded-2xl border border-accent-green shadow-2xl scale-105">
                            <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-[10px] font-black text-black shrink-0">
                              {getInitials(players.find(p => p.id === activeId)?.name || '')}
                            </div>
                            <span className="font-bold uppercase tracking-wider text-xs truncate">
                              {players.find(p => p.id === activeId)?.name}
                            </span>
                          </div>
                        ) : null}
                      </DragOverlay>
                    </DndContext>

                    <div className="pt-8 border-t border-border-subtle">
                        <Button className="w-full h-16 uppercase font-black tracking-[0.2em] shadow-2xl shadow-accent-green/20">
                           Valider et Publier ces équipes
                        </Button>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </section>

        {/* Share Section */}
        <section className="mb-20">
          <Card className="p-8 md:p-12 space-y-8 bg-background-card border-border-subtle">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                   <h3 className="text-2xl font-display font-black uppercase">Partager le match</h3>
                   <p className="text-text-secondary text-sm">Envoie ce lien à tous les joueurs pour qu'ils s'inscrivent.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                   <Button className="h-14 px-8 uppercase font-black text-xs tracking-widest gap-3 w-full md:w-auto">
                      <Copy size={18} /> Copier le lien
                   </Button>
                   <Button className="h-14 px-8 uppercase font-black text-xs tracking-widest gap-3 w-full md:w-auto bg-[#25D366] hover:bg-[#128C7E] border-none text-white">
                      <Share2 size={18} /> Partager via WhatsApp
                   </Button>
                </div>
             </div>
             
             <div className="p-4 bg-background-primary rounded-xl border border-border-subtle text-center font-mono text-xs text-accent-green truncate">
                takwira.com/match/{token}
             </div>
          </Card>
        </section>

        {/* Danger Zone */}
        <section className="pt-12 border-t border-border-subtle">
           <div className="flex flex-col items-center gap-8">
              <div className="flex items-center gap-3 text-danger opacity-50 px-6 py-2 rounded-full border border-danger/30 uppercase font-black text-[10px] tracking-widest">
                 <AlertTriangle size={14} /> Zone de danger
              </div>
              <Button 
                onClick={() => setIsCancelling(true)}
                variant="outline" 
                className="h-14 w-full md:w-80 border-danger/30 text-danger hover:bg-danger hover:text-white font-black uppercase text-xs tracking-widest"
              >
                Annuler ce match
              </Button>
           </div>
        </section>

      </div>

      {/* Manual Add Player Modal */}
      <AnimatePresence>
        {isAddingPlayer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingPlayer(false)}
              className="fixed inset-0 z-[200] bg-overlay"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[210] lg:relative lg:inset-center lg:z-auto bg-background-card rounded-t-[32px] p-8 pb-12 lg:rounded-3xl border-t border-border-subtle lg:max-w-md lg:mx-auto lg:top-1/2 lg:-translate-y-1/2 lg:fixed"
            >
               <div className="flex justify-between items-start mb-8">
                  <h3 className="text-3xl font-display font-black uppercase leading-none">Ajouter un <br /> joueur</h3>
                  <button onClick={() => setIsAddingPlayer(false)} className="text-text-tertiary hover:text-white">
                    <X size={24} />
                  </button>
               </div>

               <form onSubmit={handleAddPlayer} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Prénom du joueur</label>
                       <input 
                         required
                         type="text"
                         value={newPlayerName}
                         onChange={(e) => setNewPlayerName(e.target.value)}
                         className="w-full bg-background-secondary border border-border-subtle focus:border-accent-green focus:outline-none rounded-xl px-4 h-14 font-sans text-sm transition-all"
                         placeholder="Ex: Mourad"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Téléphone (Optionnel)</label>
                       <input 
                         type="tel"
                         value={newPlayerPhone}
                         onChange={(e) => setNewPlayerPhone(e.target.value)}
                         className="w-full bg-background-secondary border border-border-subtle focus:border-accent-green focus:outline-none rounded-xl px-4 h-14 font-sans text-sm transition-all"
                         placeholder="+216 00 000 000"
                       />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-16 font-black uppercase tracking-widest">
                    Ajouter à la liste
                  </Button>
               </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {isCancelling && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] bg-overlay px-4 flex items-center justify-center"
            >
               <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-background-card border border-danger/30 rounded-3xl p-8 max-w-sm w-full space-y-6 relative overflow-hidden"
               >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-danger" />
                  <div className="w-12 h-12 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-2">
                     <AlertTriangle size={24} />
                  </div>
                  <div className="text-center space-y-2">
                     <h3 className="text-2xl font-display font-black uppercase">Annuler le match ?</h3>
                     <p className="text-text-secondary text-xs leading-relaxed">
                        Cette action est irréversible. Les joueurs inscrits recevront une notification d'annulation.
                     </p>
                  </div>

                  <div className="space-y-3">
                     <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary text-center">
                        Tapez <span className="text-danger">ANNULER</span> pour confirmer
                     </p>
                     <input 
                        type="text"
                        value={cancelConfirmText}
                        onChange={(e) => setCancelConfirmText(e.target.value)}
                        className="w-full bg-background-secondary border border-border-subtle focus:border-danger focus:outline-none rounded-xl px-4 h-12 font-sans text-center text-sm"
                        placeholder="..."
                     />
                  </div>

                  <div className="flex flex-col gap-3">
                     <Button 
                       disabled={cancelConfirmText !== 'ANNULER'}
                       className="w-full h-12 bg-danger hover:bg-danger-hover border-none text-white font-bold uppercase tracking-widest text-[10px]"
                       onClick={() => navigate('/')}
                     >
                       Confirmer l'annulation
                     </Button>
                     <button 
                       onClick={() => { setIsCancelling(false); setCancelConfirmText(''); }}
                       className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary hover:text-white pt-2"
                     >
                        Annuler
                     </button>
                  </div>
               </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .inset-center {
           left: 50%;
           top: 50%;
           transform: translate(-50%, -50%);
        }
      `}</style>

    </div>
  );
}

const MOCK_MATCH_DATA = {
  name: "Match du Mercredi soir",
  complex: "Gammarth Foot Center",
  terrain: "Terrain 1",
  date: "22 Mai",
  time: "19:00"
};
