import * as React from 'react';
import { Target, Users, Shield, Trophy, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { SEO } from '@/src/components/layout/SEO';

const VALUES = [
  { icon: Target, title: "Mission", text: "Démocratiser l'accès au football en Tunisie en simplifiant l'organisation et la réservation." },
  { icon: Users, title: "Communauté", text: "Créer un écosystème où chaque passionné peut trouver une équipe et un terrain à tout moment." },
  { icon: Shield, title: "Confiance", text: "Garantir des transactions sécurisées et des partenariats solides avec les meilleurs complexes." },
];

export default function About() {
  return (
    <div className="pt-32 pb-20 space-y-24">
      <SEO title="À Propos | Takwira.com" description="Découvrez l'histoire de Takwira.com, la plateforme qui révolutionne le football amateur en Tunisie." />
      
      {/* Hero */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
           <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tight leading-none text-pl-purple">
             La révolution <br/> <span className="text-accent-green">du foot amateur</span>
           </h1>
           <p className="text-text-secondary text-lg font-medium leading-relaxed max-w-xl">
             Née de la passion pour le beau jeu, Takwira.com est devenue en quelques années la destination préférée pour des milliers de Tunisiens qui veulent taper dans le ballon sans tracas logistique.
           </p>
           <Button className="h-14 px-10 uppercase font-black tracking-widest text-sm shadow-[0_10px_20px_rgba(34,197,94,0.3)]">
             Rejoindre l'aventure
           </Button>
        </div>
        <div className="relative">
           <div className="aspect-square rounded-[60px] bg-background-secondary overflow-hidden border border-border-subtle rotate-2">
              <img src="https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover grayscale" alt="Team celebrating" />
           </div>
           <div className="absolute inset-0 bg-accent-green/10 rounded-[60px] -rotate-2 -z-10 border-2 border-accent-green/20" />
        </div>
      </section>

      {/* Values */}
      <section className="bg-background-secondary py-24">
        <div className="px-6 md:px-12 max-w-7xl mx-auto space-y-16">
           <div className="text-center space-y-4">
              <h2 className="text-4xl font-display font-black uppercase tracking-tight">Nos Valeurs</h2>
              <p className="text-text-secondary uppercase font-black text-[10px] tracking-widest">Ce qui nous anime au quotidien</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {VALUES.map((v, i) => (
                <Card key={i} className="p-10 text-center space-y-6 hover:translate-y-[-10px] transition-all border-border-subtle bg-background-card">
                  <div className="w-20 h-20 rounded-3xl bg-accent-green/10 text-accent-green flex items-center justify-center mx-auto border border-accent-green/20">
                    <v.icon size={36} />
                  </div>
                  <h3 className="text-2xl font-display font-black uppercase tracking-tight">{v.title}</h3>
                  <p className="text-text-secondary text-sm font-medium leading-relaxed">{v.text}</p>
                </Card>
              ))}
           </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
           {[
             { label: 'Joueurs', value: '+50k' },
             { label: 'Terrains', value: '120+' },
             { label: 'Matchs / Mois', value: '3000' },
             { label: 'Villes', value: '12' },
           ].map((stat, i) => (
             <div key={i} className="text-center space-y-2">
                <p className="text-4xl md:text-6xl font-display font-black text-pl-purple">{stat.value}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-green">{stat.label}</p>
             </div>
           ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto">
         <div className="bg-background-card border border-border-subtle rounded-[50px] p-12 md:p-20 text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight text-pl-purple max-w-2xl mx-auto leading-none">
               Prêt à fouler <br/> la pelouse ?
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              Rejoignez la plus grande communauté de footballeurs en Tunisie. Créez un compte et commencez à jouer aujourd'hui.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Button className="h-16 px-12 uppercase font-black tracking-widest text-sm shadow-xl shadow-accent-green/20">
                  Créer un compte
               </Button>
               <Button variant="outline" className="h-16 px-12 border-border-subtle uppercase font-black tracking-widest text-sm hover:border-accent-green transition-all">
                  Voir les terrains
               </Button>
            </div>
         </div>
      </section>
    </div>
  );
}
