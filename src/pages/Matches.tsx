import * as React from 'react';
import { Search, MapPin, Users, Calendar, Clock, Trophy, Filter, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { NavLink } from 'react-router-dom';
import { SEO } from '@/src/components/layout/SEO';

const MOCK_MATCHES = [
  { id: '1', title: 'Match Matinal 5v5', location: 'Gammarth Foot Center', date: '22 Mai', time: '08:00', spots: 3, totalSpots: 10, level: 'Amateur', price: 10 },
  { id: '2', title: 'Derby du Vendredi', location: 'Carthage Sports', date: '22 Mai', time: '19:00', spots: 1, totalSpots: 14, level: 'Intermédiaire', price: 15 },
  { id: '3', title: 'Match Détente', location: 'La Marsa Foot', date: '23 Mai', time: '21:00', spots: 5, totalSpots: 10, level: 'Débutant', price: 8 },
  { id: '4', title: 'Elite Session', location: 'Lac 1 Indoor', date: '23 Mai', time: '20:00', spots: 2, totalSpots: 10, level: 'Pro', price: 20 },
];

export default function Matches() {
  const [filter, setFilter] = React.useState('all');

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
      <SEO title="Matchs Ouverts | Takwira.com" description="Trouve des joueurs et rejoins un match de foot près de chez toi en Tunisie." />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tight leading-none text-white">
            Matchs <span className="text-accent-green">Ouverts</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-xl font-medium">
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
            className="w-full bg-background-secondary border border-border-subtle rounded-2xl h-14 pl-12 pr-6 outline-none focus:border-accent-green transition-all"
          />
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_MATCHES.map((match, i) => (
          <motion.div 
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="group relative overflow-hidden bg-background-card border-border-subtle hover:border-accent-green/50 transition-all p-8 flex flex-col items-start gap-6">
              <div className="flex justify-between w-full items-start">
                <Badge className="bg-accent-green/10 text-accent-green border-none font-black text-[9px] uppercase tracking-widest h-7 px-3">
                  {match.level}
                </Badge>
                <div className="text-right">
                  <p className="text-2xl font-display font-black text-white">{match.price} DT</p>
                  <p className="text-[9px] font-black uppercase text-text-tertiary tracking-widest">Par personne</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-display font-black uppercase tracking-tight text-white group-hover:text-accent-green transition-colors">
                  {match.title}
                </h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-text-secondary text-xs font-bold uppercase tracking-wide">
                    <MapPin size={14} className="text-accent-green" /> {match.location}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-text-secondary text-xs font-bold uppercase tracking-wide">
                      <Calendar size={14} className="text-accent-green" /> {match.date}
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary text-xs font-bold uppercase tracking-wide">
                      <Clock size={14} className="text-accent-green" /> {match.time}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                      Places restantes : <span className="text-accent-green">{match.spots}</span>
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                      {match.totalSpots - match.spots}/{match.totalSpots}
                    </p>
                  </div>
                  <div className="h-1.5 w-full bg-background-secondary rounded-full overflow-hidden border border-border-subtle">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((match.totalSpots - match.spots) / match.totalSpots) * 100}%` }}
                      className="h-full bg-accent-green shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                    />
                  </div>
                </div>
                
                <NavLink to={`/match/${match.id}`} className="block">
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
