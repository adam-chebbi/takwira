import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Settings, 
  ExternalLink, 
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Clock3,
  Trophy
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { db } from '@/src/lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  getDoc
} from 'firebase/firestore';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { cn } from '@/src/lib/utils';
import { Match, MatchPlayer } from '@/src/lib/schema';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MyMatches() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = React.useState<'organizer' | 'player'>('organizer');
  const [organizedMatches, setOrganizedMatches] = React.useState<Match[]>([]);
  const [playerMatches, setPlayerMatches] = React.useState<(Match & { playerStatus?: string })[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchOrganizedMatches = React.useCallback(async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'matches'),
        where('organizerId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      setOrganizedMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match)));
    } catch (err) {
      console.error("Error fetching organized matches:", err);
    }
  }, [user]);

  const fetchPlayerMatches = React.useCallback(async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'matchPlayers'),
        where('userId', '==', user.uid),
        orderBy('joinedAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const participations = snapshot.docs.map(doc => doc.data() as MatchPlayer);
      
      const matchesData = await Promise.all(
        participations.map(async (p) => {
          const matchDoc = await getDoc(doc(db, 'matches', p.matchId));
          if (matchDoc.exists()) {
            return {
              id: matchDoc.id,
              ...matchDoc.data() as Match,
              playerStatus: p.status
            };
          }
          return null;
        })
      );
      
      setPlayerMatches(matchesData.filter(m => m !== null) as (Match & { playerStatus: string })[]);
    } catch (err) {
      console.error("Error fetching player matches:", err);
    }
  }, [user]);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (activeTab === 'organizer') {
        await fetchOrganizedMatches();
      } else {
        await fetchPlayerMatches();
      }
      setLoading(false);
    };
    load();
  }, [activeTab, fetchOrganizedMatches, fetchPlayerMatches]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-accent-green/10 text-accent-green border-none">Ouvert</Badge>;
      case 'full':
        return <Badge className="bg-pl-purple/10 text-pl-purple border-none">Complet</Badge>;
      case 'completed':
        return <Badge className="bg-background-secondary text-text-tertiary border-none">Terminé</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/10 text-red-500 border-none">Annulé</Badge>;
      default:
        return <Badge className="bg-background-secondary text-text-tertiary border-none">{status}</Badge>;
    }
  };

  const getPlayerStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <div className="flex items-center gap-1.5 text-accent-green bg-accent-green/10 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
            <CheckCircle2 size={12} /> Confirmé
          </div>
        );
      case 'absent':
        return (
          <div className="flex items-center gap-1.5 text-red-500 bg-red-500/10 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
            <XCircle size={12} /> Absent
          </div>
        );
      case 'waiting':
        return (
          <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
            <Clock3 size={12} /> En attente
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background-primary pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background-primary/80 backdrop-blur-xl border-b border-border-subtle p-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
           <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-text-primary">
              <ChevronLeft size={24} />
           </button>
           <h1 className="text-sm font-black uppercase tracking-widest text-text-primary">MES MATCHS</h1>
           <div className="w-10" />
        </div>
      </div>

      <div className="max-w-xl mx-auto p-4">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-background-secondary p-1 rounded-2xl border border-border-subtle mb-8">
          <button
            onClick={() => setActiveTab('organizer')}
            className={cn(
              "flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'organizer' ? "bg-accent-green text-black shadow-lg" : "text-text-tertiary"
            )}
          >
            Organisateur
          </button>
          <button
            onClick={() => setActiveTab('player')}
            className={cn(
              "flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'player' ? "bg-accent-green text-black shadow-lg" : "text-text-tertiary"
            )}
          >
            Joueur
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 size={32} className="animate-spin text-accent-green" />
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'organizer' ? (
              organizedMatches.length > 0 ? (
                organizedMatches.map((match) => (
                  <MatchCard key={match.id} match={match} mode="organizer" />
                ))
              ) : (
                <EmptyState 
                  icon={Trophy}
                  title="AUCUN MATCH ORGANISÉ"
                  subtitle="Tu n'as pas encore organisé de match. Crée ton premier match !"
                  actionLabel="CRÉER UN MATCH"
                  onAction={() => navigate('/creer-match')}
                  className="py-20"
                />
              )
            ) : (
              playerMatches.length > 0 ? (
                playerMatches.map((match) => (
                  <MatchCard key={match.id} match={match} mode="player" />
                ))
              ) : (
                <EmptyState 
                  icon={Users}
                  title="AUCUN MATCH REJOINT"
                  subtitle="Tu n'as encore rejoint aucun match. Rejoins un match via un lien partagé."
                  className="py-20"
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );

  function MatchCard({ match, mode }: { match: any, mode: 'organizer' | 'player' }) {
    const progress = (match.currentPlayerCount / match.maxPlayers) * 100;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background-card border border-border-subtle rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase text-text-primary leading-tight line-clamp-1">
                {match.title}
              </h3>
              <div className="flex items-center gap-2 text-text-tertiary">
                <MapPin size={12} className="text-accent-green" />
                <span className="text-[10px] font-bold uppercase tracking-tight">
                  {match.locationType === 'takwira' ? `${match.terrainName} (${match.complexName})` : match.customLocation}
                </span>
              </div>
            </div>
            {getStatusBadge(match.status)}
          </div>

          <div className="flex items-center gap-4 py-3 border-y border-border-subtle/50">
            <div className="flex items-center gap-1.5 text-text-secondary">
               <Calendar size={14} className="text-pl-purple" />
               <span className="text-[11px] font-black uppercase">{match.date ? format(new Date(match.date), 'dd MMM yyyy', { locale: fr }) : '-'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-secondary">
               <Clock size={14} className="text-pl-purple" />
               <span className="text-[11px] font-black uppercase">{match.startTime} - {match.endTime}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
               <span className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">Joueurs ({match.currentPlayerCount}/{match.maxPlayers})</span>
               <span className="text-[9px] font-black uppercase text-accent-green">{match.format}</span>
            </div>
            <div className="h-1.5 bg-background-secondary rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }}
                 className={cn(
                   "h-full rounded-full transition-all duration-1000",
                   progress < 50 ? "bg-blue-500" : progress < 100 ? "bg-accent-green" : "bg-pl-purple"
                 )}
               />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            {mode === 'player' && match.playerStatus && getPlayerStatusBadge(match.playerStatus)}
            
            <div className={cn("flex items-center gap-2", mode === 'player' ? "ml-auto" : "w-full")}>
              {mode === 'organizer' && (
                <Link to={`/match/${match.linkToken}/manage`} className="flex-1">
                  <Button variant="secondary" className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    <Settings size={14} className="mr-2" /> Gérer
                  </Button>
                </Link>
              )}
              <Link to={`/match/${match.linkToken}`} className={mode === 'organizer' ? 'flex-1' : ''}>
                <Button className="h-10 px-6 rounded-xl bg-accent-green text-black text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                  <ExternalLink size={14} className="mr-2" /> Voir le match
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
}
