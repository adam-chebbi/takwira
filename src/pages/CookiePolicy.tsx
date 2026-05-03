import * as React from 'react';
import { motion } from 'motion/react';
import { Shield, PieChart, Target, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import { useCookie } from '@/src/contexts/CookieContext';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { cn } from '@/src/lib/utils';

export default function CookiePolicy() {
  const { consent, saveCustom } = useCookie();

  return (
    <div className="min-h-screen bg-background-primary pt-32 pb-32">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight text-white">
              Politique des Cookies
            </h1>
            <p className="text-text-secondary text-lg">
              Transparence totale sur la gestion de vos données chez Takwira.com
            </p>
          </div>

          <section className="space-y-8 bg-background-card border border-border-subtle rounded-[40px] p-8 md:p-12">
            <div className="prose prose-invert max-w-none">
              <p className="text-text-secondary">
                Tunisian law (INPDP) requires explicit consent for analytics and advertising cookies. 
                Nous attachons une importance capitale à votre vie privée. Cette page vous explique quels 
                cookies nous utilisons et pourquoi.
              </p>
            </div>

            <div className="space-y-6">
              <CookieTypeCard 
                icon={Shield}
                title="Cookies Essentiels"
                desc="Ces cookies sont strictement nécessaires au fonctionnement du site. Ils permettent l'authentification sécurisée, la gestion des sessions et l'accès à votre espace utilisateur. Ils ne peuvent pas être désactivés."
                status="Toujours actif"
                isLocked
                active={true}
              />
              <CookieTypeCard 
                icon={PieChart}
                title="Cookies Analytiques"
                desc="Utilisés pour comprendre comment vous interagissez avec le blog (vues d'articles, temps de lecture). Ces données nous aident à améliorer notre contenu."
                active={consent.analytics}
                onChange={(val) => saveCustom(val, consent.advertising)}
              />
              <CookieTypeCard 
                icon={Target}
                title="Cookies Publicitaires"
                desc="Permettent de mesurer l'efficacité des publicités affichées sur notre blog et de compter les clics sans vous identifier personnellement."
                active={consent.advertising}
                onChange={(val) => saveCustom(consent.analytics, val)}
              />
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-display font-black uppercase text-white">Détail des cookies utilisés</h2>
            <div className="overflow-x-auto rounded-3xl border border-border-subtle overflow-hidden bg-background-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-subtle bg-background-secondary/50">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-text-tertiary">Nom</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-text-tertiary">Fournisseur</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-text-tertiary">Objectif</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-text-tertiary">Durée</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-text-tertiary">Catégorie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  <CookieRow name="takwira_auth" provider="Firebase" purpose="Maintenir votre session" duration="30 jours" category="Essentiel" />
                  <CookieRow name="takwira_cookie_consent" provider="Takwira" purpose="Mémoriser vos choix de cookies" duration="1 an" category="Essentiel" />
                  <CookieRow name="view_count_tracker" provider="Takwira (Firestore)" purpose="Comptage des vues d'articles" duration="Session" category="Analytique" />
                  <CookieRow name="ad_tracker" provider="Takwira (Firestore)" purpose="Comptage des impressions et clics" duration="Session" category="Publicitaire" />
                </tbody>
              </table>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

function CookieTypeCard({ icon: Icon, title, desc, active, onChange, isLocked, status }: any) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-3xl bg-background-secondary/30 border border-border-subtle hover:border-accent-green/20 transition-all">
      <div className="w-14 h-14 rounded-2xl bg-background-card border border-border-subtle flex items-center justify-center text-accent-green shrink-0">
        <Icon size={24} />
      </div>
      <div className="flex-1 space-y-1 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2">
          <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
          {isLocked && <Badge className="bg-text-tertiary/10 text-text-tertiary border-none text-[8px] font-black uppercase h-4">Requis</Badge>}
        </div>
        <p className="text-xs text-text-secondary leading-relaxed max-w-xl">
          {desc}
        </p>
      </div>
      <div className="flex flex-col items-center md:items-end gap-2">
        {isLocked ? (
          <span className="text-[10px] font-black uppercase tracking-widest text-accent-green">{status}</span>
        ) : (
          <button
            onClick={() => onChange(!active)}
            className={cn(
              "w-12 h-6 rounded-full relative transition-colors",
              active ? "bg-accent-green" : "bg-background-tertiary"
            )}
          >
            <div className={cn(
              "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
              active ? "left-7" : "left-1"
            )} />
          </button>
        )}
      </div>
    </div>
  );
}

function CookieRow({ name, provider, purpose, duration, category }: any) {
  return (
    <tr className="text-xs">
      <td className="px-6 py-4 font-mono text-white">{name}</td>
      <td className="px-6 py-4 text-text-secondary">{provider}</td>
      <td className="px-6 py-4 text-text-secondary">{purpose}</td>
      <td className="px-6 py-4 text-text-tertiary">{duration}</td>
      <td className="px-6 py-4"><Badge variant="outline" className="text-[8px] font-black uppercase">{category}</Badge></td>
    </tr>
  );
}
