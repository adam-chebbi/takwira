import * as React from 'react';
import { Star, MapPin, Users, Heart, ClipboardCheck, ArrowRight, ShieldCheck, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { SEO } from '@/src/components/layout/SEO';

import { useAcademies } from '@/src/hooks/useAcademies';

export default function Academies() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { academies, isLoading } = useAcademies();

  const filteredAcademies = academies.filter(academy => 
    academy.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto space-y-16">
      <SEO title="Académies de Foot | Takwira.com" description="Inscrivez votre enfant dans les meilleures académies de football en Tunisie." />
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 space-y-8">
          <Badge className="bg-accent-green/10 text-accent-green border-none font-black text-[10px] uppercase tracking-[0.2em] px-6 h-8">
            Formation & Avenir
          </Badge>
          <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tight leading-none text-pl-purple">
            Trouve la meilleure <span className="text-accent-green">Académie</span>
          </h1>
          <p className="text-text-secondary text-lg font-medium leading-relaxed max-w-xl">
            Inscrivez vos enfants dans les meilleures écoles de football en Tunisie. Des programmes de formation adaptés à tous les âges et tous les niveaux.
          </p>
          <div className="flex gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={20} />
                <input 
                  type="text" 
                  placeholder="Zone géographique..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-background-secondary border border-border-subtle rounded-2xl h-16 pl-14 pr-6 focus:border-accent-green outline-none text-text-primary"
                />
             </div>
             <Button className="h-16 px-10 uppercase font-black tracking-widest text-sm">Chercher</Button>
          </div>
        </div>
        <div className="flex-1 relative hidden lg:block">
           <div className="aspect-[4/5] rounded-[60px] bg-background-secondary overflow-hidden border border-border-subtle rotate-3 relative z-10">
              <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover grayscale" alt="Football training" />
           </div>
           <div className="absolute inset-0 aspect-[4/5] rounded-[60px] border-2 border-accent-green -rotate-3 z-0" />
           
           <Card className="absolute -bottom-10 -left-10 p-6 bg-accent-green border-none z-20 shadow-2xl space-y-2 max-w-[240px]">
              <div className="flex items-center gap-1 text-black mb-2">
                 {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="black" />)}
              </div>
              <p className="text-black font-display font-black uppercase text-xl leading-tight">Meilleure Expérience</p>
              <p className="text-black/70 text-[10px] font-bold uppercase tracking-widest">Approuvé par +2000 parents</p>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pt-16">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-96 bg-background-card rounded-[24px] animate-pulse border border-border-subtle" />
          ))
        ) : filteredAcademies.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
            <Users size={48} className="mx-auto text-text-tertiary" />
            <h3 className="text-xl font-display font-black uppercase text-pl-purple">Aucune académie trouvée</h3>
            <p className="text-text-tertiary">Essayez une autre recherche ou revenez plus tard.</p>
          </div>
        ) : filteredAcademies.map((academy, i) => (
          <motion.div
            key={academy.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-0 overflow-hidden bg-background-card border-border-subtle flex flex-col h-full hover:border-accent-green transition-all group">
               <div className="h-48 bg-background-secondary relative overflow-hidden">
                  <img src={academy.logoUrl || "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=500&auto=format&fit=crop"} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt={academy.name} />
                  <div className="absolute top-4 left-4">
                     <Badge className="bg-white/10 backdrop-blur-md text-white border-none font-black text-[9px] uppercase tracking-widest h-7 px-3">
                        {academy.trainingTime}
                     </Badge>
                  </div>
               </div>
               
               <div className="p-8 flex-1 flex flex-col gap-6">
                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-display font-black uppercase tracking-tight text-pl-purple">{academy.name}</h3>
                        <div className="flex items-center gap-1">
                           <Star size={14} fill="#22C55E" className="text-accent-green" />
                           <span className="text-sm font-black text-pl-purple">4.8</span>
                        </div>
                     </div>
                     <p className="flex items-center gap-2 text-text-tertiary text-[10px] font-black uppercase tracking-widest">
                        <MapPin size={12} className="text-accent-green" /> En Tunisie
                     </p>
                  </div>

                  <div className="space-y-3">
                     <p className="text-text-secondary text-sm line-clamp-3 italic">
                        {academy.description || "Une académie de football d'élite pour les futurs champions."}
                     </p>
                  </div>

                  <div className="pt-6 border-t border-border-subtle mt-auto space-y-4">
                     <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Disponibilité</p>
                        <p className="text-sm font-black text-pl-purple leading-none">Inscriptions Ouvertes</p>
                     </div>
                     <Button variant="outline" className="w-full h-12 border-border-subtle uppercase font-black text-[10px] tracking-widest gap-2 hover:bg-accent-green hover:text-black hover:border-accent-green transition-all">
                        Détails & Inscription <ArrowRight size={16} />
                     </Button>
               </div>
               </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
