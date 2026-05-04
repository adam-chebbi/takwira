import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/src/contexts/AuthContext';
import { db } from '@/src/lib/firebase';
import { cn } from '@/src/lib/utils';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { Match } from '@/src/lib/schema';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { PageLoader } from '@/src/components/ui/PageLoader';
import { Calendar, MapPin, Users, ChevronRight, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export default function MyMatches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'organizer' | 'player'>('organizer');
  const [organizerMatches, setOrganizerMatches] = React.useState<Match[]>([]);
  const [playerMatches, setPlayerMatches] = React.useState<(Match & { playerStatus: string })[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch matches where organizer
        const orgQuery = query(
          collection(db, 'matches'),
          where('organizerId', '==', user.uid),
          orderBy('date', 'desc')
        );
        const orgSnapshot = await getDocs(orgQuery);
        setOrganizerMatches(orgSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match)));

        // Fetch matches where player
        const playerQuery = query(
          collection(db, 'matchPlayers'),
          where('userId', '==', user.uid)
        );
        const playerSnapshot = await getDocs(playerQuery);
        const playerMatchResults = await Promise.all(
          playerSnapshot.docs.map(async (playerDoc) => {
            const data = playerDoc.data();
            const matchDoc = await getDoc(doc(db, 'matches', data.matchId));
            if (matchDoc.exists()) {
              return { 
                id: matchDoc.id, 
                ...matchDoc.data(), 
                playerStatus: data.status 
              } as Match & { playerStatus: string };
            }
            return null;
          })
        );
        setPlayerMatches(playerMatchResults.filter(Boolean) as (Match & { playerStatus: string })[]);
      } catch (err) {
        console.error("Error fetching my matches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <PageLoader />;

  const matchesToShow = activeTab === 'organizer' ? organizerMatches : playerMatches;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-black uppercase tracking-tight text-pl-purple italic">Mes Matchs</h1>
            <p className="text-text-tertiary">Retrouve tes sessions organisées et tes convocations.</p>
          </div>
          
          <div className="flex bg-background-secondary p-1 rounded-xl border border-border-subtle shrink-0">
            <button 
              onClick={() => setActiveTab('organizer')}
              className={cn(
                "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'organizer' ? "bg-accent-green text-black shadow-lg shadow-accent-green/20" : "text-text-tertiary hover:text-white"
              )}
            >
              Organisateur
            </button>
            <button 
              onClick={() => setActiveTab('player')}
              className={cn(
                "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'player' ? "bg-accent-green text-black shadow-lg shadow-accent-green/20" : "text-text-tertiary hover:text-white"
              )}
            >
              Joueur
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {matchesToShow.length > 0 ? (
              matchesToShow.map((match) => (
                <motion.div
                  key={match.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="group overflow-hidden border border-border-subtle bg-background-card/40 backdrop-blur-xl hover:border-accent-green/30 transition-all">
                    <div className="p-6 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <Badge variant="outline" className="bg-background-secondary border-border-subtle text-[10px] uppercase tracking-widest font-black">
                            {match.format}
                          </Badge>
                          <h3 className="text-lg font-display font-black text-pl-purple italic uppercase tracking-tight line-clamp-1">{match.title}</h3>
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                          match.status === 'upcoming' ? "bg-accent-green/10 text-accent-green border-accent-green/20" :
                          match.status === 'completed' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                          "bg-danger/10 text-danger border-danger/20"
                        )}>
                          {match.status === 'upcoming' ? 'À venir' : match.status === 'completed' ? 'Terminé' : 'Annulé'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Calendar size={14} className="text-accent-green" />
                          <span className="text-xs font-bold">{format(new Date(match.date), 'dd MMMM', { locale: fr })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <MapPin size={14} className="text-accent-green" />
                          <span className="text-xs font-bold line-clamp-1">{(match as any).terrainName || 'Lieu personnalisé'}</span>
                        </div>
                      </div>

                      {activeTab === 'player' && (
                         <div className="flex items-center gap-2 py-2 px-3 bg-background-secondary rounded-lg border border-border-subtle">
                           <Trophy size={14} className="text-accent-green" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Statut:</span>
                           <span className={cn(
                             "text-[10px] font-black uppercase tracking-widest",
                             (match as any).playerStatus === 'confirmed' ? "text-accent-green" : "text-danger"
                           )}>
                             {(match as any).playerStatus === 'confirmed' ? 'Confirmé' : 'Absent'}
                           </span>
                         </div>
                      )}

                      <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Users size={14} className="text-text-tertiary" />
                           <span className="text-xs font-bold text-white">?? / {match.maxPlayers}</span>
                        </div>
                        <Button 
                          onClick={() => navigate(activeTab === 'organizer' ? `/match/${match.linkToken}/manage` : `/match/${match.linkToken}`)}
                          variant="ghost" 
                          size="sm" 
                          className="text-accent-green hover:bg-accent-green/10 gap-2"
                        >
                          {activeTab === 'organizer' ? 'Gérer' : 'Voir'} <ChevronRight size={14} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-6">
                <div className="w-20 h-20 bg-background-secondary border border-border-subtle rounded-full flex items-center justify-center mx-auto text-text-tertiary">
                  <Users size={32} className="opacity-20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-display font-black uppercase italic text-pl-purple">Aucun match trouvé</h3>
                  <p className="text-text-tertiary text-sm">Tu n'as pas encore de matchs dans cette catégorie.</p>
                </div>
                <Button onClick={() => navigate('/creer-match')} className="uppercase font-black tracking-widest h-14 px-8">
                  Organiser un match
                </Button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
