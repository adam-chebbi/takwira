import * as React from 'react';
import { Search, ChevronRight, Book, Shield, Users, CreditCard, HelpCircle, MessageCircle } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Input } from '@/src/components/ui/Input';

const CATEGORIES = [
  { icon: Users, title: "Mon Compte", description: "Gérer votre profil et vos préférences.", count: 12 },
  { icon: Shield, title: "Réservations", description: "Comment réserver, annuler ou modifier.", count: 15 },
  { icon: CreditCard, title: "Paiements", description: "Tout sur les tarifs et modes de paiement.", count: 8 },
  { icon: MessageCircle, title: "Matchs Ouverts", description: "Rejoindre ou créer des matchs publics.", count: 10 },
  { icon: Book, title: "Pour les Gérants", description: "Guides pour la gestion de complexes.", count: 20 },
  { icon: HelpCircle, title: "Autre", description: "Questions diverses sur Takwira.", count: 5 },
];

const FAQS = [
  { q: "Comment annuler une réservation ?", a: "Vous pouvez annuler votre réservation depuis votre profil sous l'onglet 'Mes Matchs' jusqu'à 24h avant le début du match." },
  { q: "Quels sont les modes de paiement ?", a: "Nous acceptons les paiements par carte bancaire, virement, ou directement sur place selon les complexes." },
  { q: "Comment créer un match public ?", a: "Cliquez sur 'Créer un Match' dans la barre de navigation et choisissez 'Match Ouvert'." },
];

export default function HelpCenter() {
  return (
    <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto space-y-20">
      {/* Hero Section */}
      <div className="text-center space-y-8 max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-display font-black uppercase tracking-tight leading-none text-pl-purple">
          Centre d'aide
        </h1>
        <p className="text-text-secondary text-lg font-medium">
          Trouvez des réponses rapides à vos questions sur l'utilisation de Takwira.
        </p>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un sujet ou un mot-clé..."
            className="w-full bg-background-secondary border border-border-subtle rounded-2xl h-16 pl-14 pr-6 focus:border-accent-green outline-none transition-all text-text-primary"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat, i) => (
          <Card key={i} className="p-8 hover:border-accent-green transition-all cursor-pointer group">
            <div className="w-14 h-14 rounded-2xl bg-background-secondary border border-border-subtle flex items-center justify-center text-accent-green mb-6 group-hover:scale-110 transition-transform">
              <cat.icon size={28} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-tight text-pl-purple mb-2">{cat.title}</h3>
            <p className="text-text-secondary text-sm font-medium mb-4">{cat.description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{cat.count} ARTICLES</span>
              <ChevronRight size={18} className="text-text-tertiary" />
            </div>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="space-y-10">
        <h2 className="text-3xl font-display font-black uppercase tracking-tight text-center">Questions Fréquentes</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {FAQS.map((faq, i) => (
            <details key={i} className="group bg-background-card border border-border-subtle rounded-2xl overflow-hidden">
              <summary className="p-6 flex items-center justify-between cursor-pointer hover:bg-background-secondary transition-colors">
                <span className="font-bold text-pl-purple uppercase tracking-wider text-sm">{faq.q}</span>
                <ChevronRight className="group-open:rotate-90 transition-transform text-text-tertiary" size={18} />
              </summary>
              <div className="px-6 pb-6 text-text-secondary text-sm font-medium leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-background-card border border-border-subtle rounded-[40px] p-12 text-center space-y-6">
        <h3 className="text-3xl font-display font-black uppercase tracking-tight">Vous n'avez pas trouvé ?</h3>
        <p className="text-text-secondary max-w-md mx-auto">Notre service client est disponible 7j/7 pour vous accompagner dans vos démarches.</p>
        <button className="bg-accent-green text-black px-10 h-14 rounded-2xl font-black uppercase tracking-widest hover:brightness-110 transition-all">
          Nous contacter
        </button>
      </div>
    </div>
  );
}
