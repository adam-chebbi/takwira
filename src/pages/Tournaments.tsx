import * as React from 'react';
import { Trophy, Calendar, MapPin, Users, Star, Medal, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { SEO } from '@/src/components/layout/SEO';

const MOCK_TOURNAMENTS = [
  { 
    id: '1', 
    title: 'Tunis Summer Cup 2026', 
    location: 'Gammarth Sport Village', 
    date: '15-20 Juin', 
    price: 350, 
    format: '7v7',
    teams: 16,
    maxTeams: 24,
    prize: '5,000 DT',
    level: 'Open'
  },
  { 
    id: '2', 
    title: 'Corporate League Business', 
    location: 'Lac 2 Indoor', 
    date: '1 Juillet', 
    price: 800, 
    format: '5v5',
    teams: 10,
    maxTeams: 12,
    prize: 'Trophée + Voyage',
    level: 'Entreprise'
  },
  { 
    id: '3', 
    title: 'U18 Academy Stars', 
    location: 'Menzah 6', 
    date: '10 Juillet', 
    price: 150, 
    format: '11v11',
    teams: 8,
    maxTeams: 8,
    prize: 'Equipement Sportif',
    level: 'U18'
  },
];

export default function Tournaments() {
  return (
    <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto space-y-16">
      <SEO title="Tournois de Foot | Takwira.com" description="Participe aux tournois de football les plus excitants en Tunisie. Inscris ton équipe dès maintenant." />
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="flex justify-center">
          <Badge className="bg-accent-green/10 text-accent-green border-none font-black text-[10px] uppercase tracking-[0.2em] px-6 h-8 mb-4">
            Compétition
          </Badge>
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tight leading-none text-white">
          Tournois <span className="text-accent-green">Légendaires</span>
        </h1>
        <p className="text-text-secondary text-lg font-medium leading-relaxed">
          Inscris ton équipe et participe aux plus grands tournois de quartier ou corpo en Tunisie. Montrez votre talent et gagnez des trophées.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_TOURNAMENTS.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="group relative overflow-hidden bg-background-card border-border-subtle p-0 flex flex-col h-full border-b-[6px] border-b-accent-green">
              {/* Card Header Illustration (Conceptual) */}
              <div className="h-40 bg-background-secondary relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background-card" />
                <Trophy size={80} className="text-accent-green/20 group-hover:scale-110 group-hover:text-accent-green/40 transition-all duration-500" />
                <Badge className="absolute top-4 right-4 bg-black/50 text-white border-none font-black text-[9px] uppercase tracking-widest backdrop-blur-md">
                   {t.level}
                </Badge>
              </div>

              <div className="p-8 flex-1 flex flex-col gap-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-black uppercase tracking-tight text-white line-clamp-1">{t.title}</h3>
                  <div className="flex items-center gap-2 text-text-tertiary text-xs font-bold uppercase tracking-widest">
                    <MapPin size={14} className="text-accent-green" /> {t.location}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background-secondary/50 p-4 rounded-xl border border-border-subtle/50">
                    <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-1">Format</p>
                    <p className="text-sm font-black text-white uppercase">{t.format}</p>
                  </div>
                  <div className="bg-background-secondary/50 p-4 rounded-xl border border-border-subtle/50">
                    <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-1">Équipes</p>
                    <p className="text-sm font-black text-white uppercase">{t.teams}/{t.maxTeams}</p>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center text-accent-green">
                            <Medal size={20} />
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">Prix à gagner</p>
                            <p className="text-xs font-black text-white uppercase">{t.prize}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">Frais</p>
                         <p className="text-lg font-display font-black text-white">{t.price} DT</p>
                      </div>
                   </div>

                   <Button className="w-full h-14 uppercase font-black text-xs tracking-widest gap-2">
                      S'inscrire <Star size={16} fill="currentColor" />
                   </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Organizer Call to action */}
      <div className="bg-accent-green p-12 rounded-[40px] flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden group">
        <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
        <div className="space-y-4 relative z-10 text-center lg:text-left">
           <h2 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight text-black leading-none">
              Organise ton propre tournoi
           </h2>
           <p className="text-black/70 font-bold max-w-lg">
             Nous fournissons les outils de gestion, le tableau des scores et la visibilité nécessaire pour faire de ton événement un succès.
           </p>
        </div>
        <Button className="h-16 px-12 bg-black text-white uppercase font-black tracking-widest text-sm hover:translate-y-[-2px] transition-all relative z-10">
           Lancer mon tournoi
        </Button>
      </div>
    </div>
  );
}
