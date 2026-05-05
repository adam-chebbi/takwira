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
  Check,
  Info
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
import { updateDoc, doc, deleteDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { createNotification } from '@/src/lib/notifications';
import { useAuth } from '@/src/contexts/AuthContext';
import { useMatch } from '@/src/hooks/useMatch';
import MatchChat from '@/src/components/match/MatchChat';
import { useToast } from '@/src/components/ui/Toast';
import { MatchPlayer } from '@/src/lib/schema';

// --- Helpers ---
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
  player: MatchPlayer;
  isDragging?: boolean;
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
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0", getAvatarColor(player.playerName))}>
        {getInitials(player.playerName)}
      </div>
      <span className="font-bold uppercase tracking-wider text-xs truncate">{player.playerName}</span>
    </div>
  );
}

export default function MatchManage() {
  const { token } = useParams();
  const { user, userProfile } = useAuth();
  const { match, players, isLoading: matchLoading } = useMatch(token);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = React.useState<'players' | 'teams'>('players');
  const [teamMode, setTeamMode] = React.useState<'random' | 'manual'>('random');
  const [localPlayers, setLocalPlayers] = React.useState<MatchPlayer[]>([]);
  
  const [isAddingPlayer, setIsAddingPlayer] = React.useState(false);
  const [newPlayerName, setNewPlayerName] = React.useState('');
  const [newPlayerPhone, setNewPlayerPhone] = React.useState('');
  const [isShuffling, setIsShuffling] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [cancelConfirmText, setCancelConfirmText] = React.useState('');
  const [phoneVisibility, setPhoneVisibility] = React.useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // Sync local players with hook players for team building (local sorting/assignment)
  React.useEffect(() => {
    if (players.length > 0) {
      setLocalPlayers(players);
    }
  }, [players]);

  // Auth Guard
  React.useEffect(() => {
    if (!matchLoading && match) {
      if (!user || match.organizerId !== user.uid) {
        toast("Accès réservé à l'organisateur.", 'error');
        navigate(`/match/${token}`);
      }
    }
  }, [matchLoading, match, user, navigate, token, toast]);

  const togglePhoneVisibility = (id: string) => {
    setPhoneVisibility(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const markAbsent = async (id: string) => {
    try {
      await updateDoc(doc(db, 'matchPlayers', id), {
        status: 'absent'
      });
      toast("Joueur marqué absent", 'info');
    } catch (err) {
      console.error(err);
      toast("Impossible de mettre à jour le statut.", 'error');
    }
  };

  const removePlayer = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment retirer ce joueur ?")) return;
    try {
      await deleteDoc(doc(db, 'matchPlayers', id));
      toast("Joueur retiré du match", 'success');
    } catch (err) {
      console.error(err);
      toast("Erreur lors de la suppression.", 'error');
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim() || !match) return;
    
    try {
      await addDoc(collection(db, 'matchPlayers'), {
        matchId: match.id,
        playerName: newPlayerName,
        playerPhone: newPlayerPhone || null,
        userId: null,
        status: 'confirmed',
        joinedAt: serverTimestamp()
      });
      
      setNewPlayerName('');
      setNewPlayerPhone('');
      setIsAddingPlayer(false);
      toast(`${newPlayerName} a rejoint le match.`, 'success');
    } catch (err) {
      console.error(err);
      toast("Impossible d'ajouter le joueur.", 'error');
    }
  };

  const handleRandomizeTeams = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const confirmedPlayers = localPlayers.filter(p => p.status === 'confirmed');
      const shuffled = [...confirmedPlayers].sort(() => Math.random() - 0.5);
      
      const newPlayers = localPlayers.map(p => {
        if (p.status !== 'confirmed') return p;
        const index = shuffled.findIndex(s => s.id === p.id);
        return { ...p, team: index < shuffled.length / 2 ? 'A' : 'B' };
      });
      
      setLocalPlayers(newPlayers);
      setIsShuffling(false);
    }, 1500);
  };

  const handleCancelMatch = async () => {
    if (cancelConfirmText.toLowerCase() !== 'annuler') {
      toast("Veuillez saisir 'annuler' pour confirmer.", 'error');
      return;
    }

    if (!match) return;

    try {
      await updateDoc(doc(db, 'matches', match.id), {
        status: 'cancelled'
      });

      if (match.reservationId) {
        await updateDoc(doc(db, 'reservations', match.reservationId), {
          status: 'cancelled'
        });
      }

      const confirmedWithUserId = players.filter(p => p.userId && p.status === 'confirmed');
      for (const p of confirmedWithUserId) {
        await createNotification(
          p.userId!,
          'reservation_cancelled',
          'Match annulé',
          `Le match "${match.title}" a été annulé par l'organisateur.`,
          match.id
        );
      }

      toast("Le match a été annulé avec succès.", 'success');
      navigate('/mes-matchs');
    } catch (err) {
      console.error(err);
      toast("Erreur lors de l'annulation.", 'error');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    setLocalPlayers(prev => prev.map(p => {
      if (p.id !== activeId) return p;
      if (overId === 'teamA') return { ...p, team: 'A' };
      if (overId === 'teamB') return { ...p, team: 'B' };
      if (overId === 'unassigned') return { ...p, team: undefined };
      return p;
    }));
  };

  const handlePublishTeams = async () => {
    if (!match) return;
    
    try {
      const teamA = localPlayers.filter(p => (p as any).team === 'A').map(p => p.playerName);
      const teamB = localPlayers.filter(p => (p as any).team === 'B').map(p => p.playerName);
      
      await updateDoc(doc(db, 'matches', match.id), {
        teamA,
        teamB,
        teamsPublished: true
      });

      const playersToNotify = players.filter(p => p.userId && p.status === 'confirmed');
      for (const p of playersToNotify) {
        await createNotification(
          p.userId!,
          'team_published',
          'Équipes publiées !',
          `Les équipes pour le match "${match.title}" sont prêtes. Découvre la tienne !`,
          match.id
        );
      }
      
      toast("Équipes publiées !", 'success');
      navigate(`/match/${token}`);
    } catch (err) {
      console.error("Error publishing teams:", err);
      toast("Erreur lors de la publication.", 'error');
    }
  };

  if (matchLoading || !match) {
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

  const confirmedCount = players.filter(p => p.status === 'confirmed').length;
  const spotsLeft = Math.max(0, match.maxPlayers - confirmedCount);
  const matchUrl = typeof window !== 'undefined' ? `${window.location.origin}/match/${token}` : "";

  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      <div className="flex-1 pt-24 pb-32 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight leading-none text-text-primary">
              Gérer <span className="text-accent-green">le Match</span>
            </h1>
            <p className="text-text-secondary font-medium uppercase tracking-widest text-xs">
              {match.title} · {match.complexName}
            </p>
          </div>
          <Link 
            to={`/match/${token}`} 
            className="flex items-center gap-2 text-accent-green font-bold text-xs uppercase tracking-widest hover:underline group"
          >
            Voir la page publique <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { label: "Confirmés", val: confirmedCount, color: "text-accent-green" },
            { label: "Places restantes", val: spotsLeft, color: spotsLeft > 0 ? "text-text-primary" : "text-warning" },
            { label: "Statut match", val: match.status.toUpperCase(), color: match.status === 'confirmed' ? "text-accent-green" : "text-warning", isBadge: true }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={cn("p-6 bg-background-card border-t-2 relative overflow-hidden group", i === 0 ? "border-accent-green" : "border-border-subtle")}>
                <div className="absolute inset-0 bg-accent-green/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="space-y-1 relative">
                   <p className="text-[10px] uppercase font-black tracking-widest text-text-tertiary">{stat.label}</p>
                   {stat.isBadge ? (
                     <Badge className={cn(
                       "font-black h-8 px-4 mt-2",
                       match.status === 'confirmed' ? "bg-accent-green/10 text-accent-green border-accent-green/20" : "bg-warning/10 text-warning border-warning/20"
                     )}>
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
                         getAvatarColor(player.playerName)
                      )}>
                        {getInitials(player.playerName)}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold uppercase tracking-wider text-sm">{player.playerName}</h4>
                        {player.playerPhone && (
                          <div className="flex items-center gap-2 text-[10px] font-sans font-bold text-text-secondary">
                             <span className="tracking-[0.2em]">
                               {phoneVisibility[player.id] ? `+216 ${player.playerPhone}` : "+216 **** ****"}
                             </span>
                             <button onClick={() => togglePhoneVisibility(player.id)} className="hover:text-accent-green">
                               {phoneVisibility[player.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                             </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge 
                        className={cn(
                          "h-8 px-4 font-black uppercase tracking-widest text-[9px] select-none",
                          player.status === 'confirmed' ? "bg-accent-green/10 text-accent-green border-accent-green/20" :
                          player.status === 'absent' ? "bg-danger/10 text-danger border-danger/20" :
                          "bg-warning/10 text-warning border-warning/20"
                        )}
                      >
                        {player.status === 'confirmed' ? 'Confirmé' : player.status === 'absent' ? 'Absent' : 'En attente'}
                      </Badge>

                      <div className="relative group/menu">
                        <Button variant="outline" size="sm" className="h-10 w-10 p-0 text-text-tertiary">
                          <MoreVertical size={18} />
                        </Button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-background-card border border-border-subtle rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 overflow-hidden">
                           <button 
                             onClick={() => markAbsent(player.id)}
                             className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-background-secondary flex items-center gap-2 text-danger"
                           >
                              <UserMinus size={14} /> Marquer Absent
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
                            {localPlayers.map((p, i) => (
                              <motion.div
                                key={p.id}
                                className={cn("absolute w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center text-[8px] font-black", getAvatarColor(p.playerName))}
                                initial={{ top: '50%', left: '50%' }}
                                animate={{ 
                                  top: `${50 + Math.sin(i * 137) * 40}%`, 
                                  left: `${50 + Math.cos(i * 137) * 40}%`,
                                  rotate: [0, 360 * 3]
                                }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                              >
                                {getInitials(p.playerName)}
                              </motion.div>
                            ))}
                         </div>
                         <p className="mt-8 text-xl font-display font-black uppercase tracking-tight text-accent-green animate-pulse">Brassage en cours...</p>
                      </div>
                    ) : localPlayers.some(p => (p as any).team) ? (
                      <div className="w-full space-y-12">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                               <Badge className="bg-accent-green text-black font-black uppercase tracking-[0.3em] w-full justify-center h-12 text-sm shadow-[0_0_20px_rgba(34,197,94,0.3)]">Équipe A ({localPlayers.filter(p => (p as any).team === 'A').length})</Badge>
                               <div className="space-y-2">
                                  {localPlayers.filter(p => (p as any).team === 'A').map((p, i) => (
                                    <motion.div 
                                      key={p.id} 
                                      initial={{ x: -20, opacity: 0 }} 
                                      animate={{ x: 0, opacity: 1 }}
                                      transition={{ delay: i * 0.05 }}
                                      className="flex items-center gap-3 p-3 bg-background-primary/50 rounded-2xl border border-border-subtle"
                                    >
                                       <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black", getAvatarColor(p.playerName))}>
                                         {getInitials(p.playerName)}
                                       </div>
                                       <span className="font-bold uppercase tracking-wider text-xs">{p.playerName}</span>
                                    </motion.div>
                                  ))}
                               </div>
                            </div>
                            <div className="space-y-6">
                               <Badge className="bg-background-secondary text-text-secondary border border-border-subtle font-black uppercase tracking-[0.3em] w-full justify-center h-12 text-sm">Équipe B ({localPlayers.filter(p => (p as any).team === 'B').length})</Badge>
                               <div className="space-y-2">
                                  {localPlayers.filter(p => (p as any).team === 'B').map((p, i) => (
                                    <motion.div 
                                      key={p.id} 
                                      initial={{ x: 20, opacity: 0 }} 
                                      animate={{ x: 0, opacity: 1 }}
                                      transition={{ delay: i * 0.05 }}
                                      className="flex items-center gap-3 p-3 bg-background-primary/50 rounded-2xl border border-border-subtle"
                                    >
                                       <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black", getAvatarColor(p.playerName))}>
                                         {getInitials(p.playerName)}
                                       </div>
                                       <span className="font-bold uppercase tracking-wider text-xs">{p.playerName}</span>
                                    </motion.div>
                                  ))}
                               </div>
                            </div>
                         </div>
                         <div className="flex flex-col md:flex-row gap-4 pt-8">
                            <Button onClick={handleRandomizeTeams} variant="outline" className="flex-1 h-14 uppercase font-black text-xs tracking-widest gap-2">
                               <RotateCcw size={18} /> Re-mélanger
                            </Button>
                            <Button onClick={handlePublishTeams} className="flex-[2] h-14 uppercase font-black text-xs tracking-widest gap-2">
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
                            <p className="text-text-secondary text-sm max-w-xs">On brasse les joueurs pour créer deux équipes équilibrées en un clic.</p>
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
                      onDragEnd={handleDragEnd}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                         <div className="space-y-6">
                            <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Équipe A</span>
                               <Badge className="bg-accent-green text-black font-black uppercase text-[10px]">{localPlayers.filter(p => (p as any).team === 'A').length}</Badge>
                            </div>
                            <div id="teamA" className={cn(
                              "min-h-[200px] p-4 bg-background-primary/50 border-2 border-dashed rounded-[32px] transition-colors flex flex-col gap-3",
                              localPlayers.filter(p => (p as any).team === 'A').length === 0 ? "border-border-subtle" : "border-accent-green/30"
                            )}>
                              <SortableContext items={localPlayers.filter(p => (p as any).team === 'A').map(p => p.id)} strategy={verticalListSortingStrategy}>
                                {localPlayers.filter(p => (p as any).team === 'A').map(p => (
                                  <SortablePlayerChip key={p.id} player={p} />
                                ))}
                              </SortableContext>
                              {localPlayers.filter(p => (p as any).team === 'A').length === 0 && (
                                <div className="flex-1 flex items-center justify-center text-text-tertiary text-xs font-bold uppercase tracking-widest opacity-20">DÉPOSER ICI</div>
                              )}
                            </div>
                         </div>

                         <div className="space-y-6">
                            <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Équipe B</span>
                               <Badge className="bg-background-secondary text-text-secondary border border-border-subtle font-black uppercase text-[10px]">{localPlayers.filter(p => (p as any).team === 'B').length}</Badge>
                            </div>
                            <div id="teamB" className={cn(
                              "min-h-[200px] p-4 bg-background-primary/50 border-2 border-dashed rounded-[32px] transition-colors flex flex-col gap-3",
                              localPlayers.filter(p => (p as any).team === 'B').length === 0 ? "border-border-subtle" : "border-white/20"
                            )}>
                              <SortableContext items={localPlayers.filter(p => (p as any).team === 'B').map(p => p.id)} strategy={verticalListSortingStrategy}>
                                {localPlayers.filter(p => (p as any).team === 'B').map(p => (
                                  <SortablePlayerChip key={p.id} player={p} />
                                ))}
                              </SortableContext>
                              {localPlayers.filter(p => (p as any).team === 'B').length === 0 && (
                                <div className="flex-1 flex items-center justify-center text-text-tertiary text-xs font-bold uppercase tracking-widest opacity-20">DÉPOSER ICI</div>
                              )}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-6 pt-12 border-t border-border-subtle">
                         <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-text-tertiary">Joueurs disponibles</h4>
                            <div className="flex gap-2">
                               <Button size="sm" variant="outline" onClick={() => {
                                 const unassigned = localPlayers.filter(p => !(p as any).team && p.status === 'confirmed');
                                 const teamA = localPlayers.filter(p => (p as any).team === 'A');
                                 const teamB = localPlayers.filter(p => (p as any).team === 'B');
                                 
                                 let newPlayers = [...localPlayers];
                                 unassigned.forEach((p, i) => {
                                   const targetTeam = (teamA.length + i) <= (teamB.length + (unassigned.length - i - 1)) ? 'A' : 'B';
                                   newPlayers = newPlayers.map(np => np.id === p.id ? { ...np, team: targetTeam as 'A' | 'B' } : np);
                                 });
                                 setLocalPlayers(newPlayers);
                               }} className="h-9 px-4 text-[10px] uppercase font-black tracking-widest gap-2">
                                  <Shuffle size={12} /> Équilibrer
                               </Button>
                               <Button size="sm" variant="outline" onClick={() => setLocalPlayers(prev => prev.map(p => ({ ...p, team: undefined })))} className="h-9 px-4 text-[10px] uppercase font-black tracking-widest gap-2 border-danger/30 text-danger hover:bg-danger/10">
                                  Tout effacer
                               </Button>
                            </div>
                         </div>
                         <div id="unassigned" className="p-6 bg-background-secondary/30 border border-border-subtle rounded-[24px] flex flex-wrap gap-3 min-h-[100px]">
                            <SortableContext items={localPlayers.filter(p => !(p as any).team && p.status === 'confirmed').map(p => p.id)}>
                              {localPlayers.filter(p => !(p as any).team && p.status === 'confirmed').map(p => (
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
                              {getInitials(localPlayers.find(p => p.id === activeId)?.playerName || '')}
                            </div>
                            <span className="font-bold uppercase tracking-wider text-xs truncate">
                              {localPlayers.find(p => p.id === activeId)?.playerName}
                            </span>
                          </div>
                        ) : null}
                      </DragOverlay>
                    </DndContext>

                    <div className="pt-8 border-t border-border-subtle">
                        <Button onClick={handlePublishTeams} className="w-full h-16 uppercase font-black tracking-[0.2em] shadow-2xl shadow-accent-green/20">
                           Valider et Publier ces équipes
                        </Button>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </section>

        <section className="mb-20">
          <Card className="p-8 md:p-12 space-y-8 bg-background-card border-border-subtle">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                   <h3 className="text-2xl font-display font-black uppercase">Partager le match</h3>
                   <p className="text-text-secondary text-sm">Envoie ce lien à tous les joueurs pour qu'ils s'inscrivent.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                   <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(matchUrl);
                      toast("Lien copié !", 'success');
                    }}
                    className="h-14 px-8 uppercase font-black text-xs tracking-widest gap-3 w-full md:w-auto"
                   >
                      <Copy size={18} /> Copier le lien
                   </Button>
                   <Button 
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Rejoins notre match sur Takwira : " + matchUrl)}`, '_blank')}
                    className="h-14 px-8 uppercase font-black text-xs tracking-widest gap-3 w-full md:w-auto bg-[#25D366] hover:bg-[#128C7E] border-none text-white"
                   >
                      <Share2 size={18} /> Partager via WhatsApp
                   </Button>
                </div>
             </div>
             
             <div className="p-4 bg-background-primary rounded-xl border border-border-subtle text-center font-mono text-xs text-accent-green truncate">
                {matchUrl}
             </div>
          </Card>
        </section>

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
      </div>

    <MatchChat 
      matchId={match.id} 
      currentUser={user} 
      userProfile={userProfile} 
      isOrganizer={true}
    />

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
              className="fixed bottom-0 left-0 right-0 z-[210] lg:relative lg:inset-center lg:z-auto bg-background-card rounded-t-[32px] p-8 pb-12 lg:rounded-3xl border-t border-border-subtle lg:max-w-md lg:mx-auto lg:top-1/2 lg:-translate-y-1/2 lg:fixed shadow-2xl"
            >
               <div className="flex justify-between items-start mb-8">
                  <h3 className="text-3xl font-display font-black uppercase leading-none">Ajouter un <br /> joueur</h3>
                  <button onClick={() => setIsAddingPlayer(false)} className="text-text-tertiary hover:text-white">
                    <X size={24} />
                  </button>
               </div>

               <form onSubmit={handleManualAdd} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Nom du joueur *</label>
                    <input 
                      type="text"
                      required
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder="Ex: Ahmed"
                      className="w-full h-14 bg-background-primary border border-border-subtle rounded-2xl px-6 focus:outline-none focus:border-accent-green transition-colors font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Téléphone (Optionnel)</label>
                    <input 
                      type="tel"
                      value={newPlayerPhone}
                      onChange={(e) => setNewPlayerPhone(e.target.value)}
                      placeholder="Ex: 55 123 456"
                      className="w-full h-14 bg-background-primary border border-border-subtle rounded-2xl px-6 focus:outline-none focus:border-accent-green transition-colors font-bold"
                    />
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-background-secondary rounded-2xl border border-border-subtle">
                    <Info size={16} className="text-accent-green shrink-0 mt-0.5" />
                    <p className="text-[10px] text-text-secondary leading-relaxed font-medium">
                      Ce joueur sera ajouté directement avec le statut <span className="text-accent-green font-bold">CONFIRMÉ</span>.
                    </p>
                  </div>

                  <Button type="submit" className="w-full h-16 uppercase font-black tracking-widest">
                    Confirmer l'ajout
                  </Button>
               </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCancelling && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCancelling(false)}
              className="fixed inset-0 z-[300] bg-overlay"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-center z-[310] w-full max-w-md p-8 bg-background-card border border-border-subtle rounded-3xl space-y-8 shadow-2xl"
            >
               <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-display font-black uppercase">Annuler le match ?</h3>
                    <p className="text-text-secondary text-sm">Cette action informera tous les joueurs et annulera la réservation du terrain.</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest text-center">Tapez <span className="text-danger">"ANNULER"</span> pour confirmer</p>
                  <input 
                    type="text"
                    value={cancelConfirmText}
                    onChange={(e) => setCancelConfirmText(e.target.value)}
                    className="w-full h-14 bg-background-primary border-2 border-danger/20 rounded-2xl px-6 text-center focus:outline-none focus:border-danger transition-colors font-black uppercase tracking-widest"
                  />
               </div>

               <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setIsCancelling(false)} className="flex-1 h-14 uppercase font-black text-xs">Fermer</Button>
                  <Button onClick={handleCancelMatch} className="flex-1 h-14 bg-danger hover:bg-danger/80 text-white uppercase font-black text-xs border-none">Confirmer</Button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
