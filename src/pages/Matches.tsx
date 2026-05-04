import * as React from 'react';
import { Search, MapPin, Users, Calendar, Clock, Trophy, Filter, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { NavLink } from 'react-router-dom';
import { SEO } from '@/src/components/layout/SEO';
import { useMatches } from '@/src/hooks/useMatches';

export default function Matches() {
  const [filter, setFilter] = React.useState('all');
  const { matches, isLoading } = useMatches({ status: 'upcoming' });

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
      <SEO title="Matchs Ouverts | Takwira.com" description="Trouve des joueurs et rejoins un match de foot près de chez toi en Tunisie." />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tight leading-none text-pl-purple">
            Matchs <span className="text-accent-green">Ouverts</span>
          </h1>
          <p className="text-text-secondary text-lg font-medium max-w-xl">
            Trouve une équipe et rejoins un match près de chez toi. Plus besoin d'attendre 9 amis pour jouer.
          </p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="border-border-subtle h-14 uppercase font-black text-xs tracking-widest gap-2">
             <History size={18} /> Historique
           </Button>
           <NavLink to="/terrains">
             <Button className="h-14 px-8 uppercase font-black text-xs tracking-widest bg-white text-black hover:bg-white/90">
               Créer un match
             </Button>
           </NavLink>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between pt-8 border-t border-border-subtle">
        <div className="flex gap-2">
           {['Tous', '5v5', '7v7', '11v11'].map(f => (
             <button 
              key={f}
              onClick={() => setFilter(f.toLowerCase())}
              className={`px-6 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f.toLowerCase() ? 'bg-accent-green text-black' : 'bg-background-secondary text-text-tertiary border border-border-subtle hover:border-accent-green'}`}
             >
               {f}
             </button>
           ))}
        </div>
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent-green transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Ville, complexe ou niveau..."
            className="w-full bg-background-secondary border border-border-subtle rounded-2xl h-14 pl-12 pr-6 outline-none focus:border-accent-green transition-all text-text-primary"
          />
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 bg-background-card rounded-[24px] animate-pulse border border-border-subtle" />
          ))
        ) : matches.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
            <Users size={48} className="mx-auto text-text-tertiary" />
            <h3 className="text-xl font-display font-black uppercase text-pl-purple">Aucun match trouvé</h3>
            <p className="text-text-tertiary">Il n'y a pas de match ouvert pour le moment.</p>
          </div>
        ) : matches.map((match, i) => (
          <motion.div 
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="group relative overflow-hidden bg-background-card border-border-subtle hover:border-accent-green/50 transition-all p-8 flex flex-col items-start gap-6">
              <div className="flex justify-between w-full items-start">
                <Badge className="bg-accent-green/10 text-accent-green border-none font-black text-[9px] uppercase tracking-widest h-7 px-3">
                  Match Amical
                </Badge>
                <div className="text-right">
                  <p className="text-2xl font-display font-black text-pl-purple">{match.format}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-display font-black uppercase tracking-tight text-pl-purple group-hover:text-accent-green transition-colors">
                  {match.title}
                </h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-text-secondary text-xs font-bold uppercase tracking-wide">
                     {match.organizerName}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-text-secondary text-xs font-bold uppercase tracking-wide">
                      <Calendar size={14} className="text-accent-green" /> {match.date}
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary text-xs font-bold uppercase tracking-wide">
                      <Clock size={14} className="text-accent-green" /> {match.startTime}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                      Joueurs inscrits
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                      {(match.teamA?.length || 0) + (match.teamB?.length || 0)}/{match.maxPlayers}
                    </p>
                  </div>
                  <div className="h-1.5 w-full bg-background-secondary rounded-full overflow-hidden border border-border-subtle">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(((match.teamA?.length || 0) + (match.teamB?.length || 0)) / match.maxPlayers) * 100}%` }}
                      className="h-full bg-accent-green shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                    />
                  </div>
                </div>
                
                <NavLink to={`/match/${match.linkToken}`} className="block w-full">
                  <Button className="w-full h-12 uppercase font-black text-[10px] tracking-widest gap-2 bg-background-secondary border border-border-subtle hover:bg-accent-green hover:text-black transition-all">
                    Rejoindre <Users size={16} />
                  </Button>
                </NavLink>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

