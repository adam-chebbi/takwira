import * as React from 'react';

export default function Privacy() {
  return (
    <div className="pt-40 pb-20 px-6 md:px-12 max-w-4xl mx-auto space-y-12">
      <div className="space-y-4">
        <h1 className="text-5xl font-display font-black uppercase tracking-tight text-white">Politique de confidentialité</h1>
        <p className="text-text-tertiary text-sm font-black uppercase tracking-widest">Dernière mise à jour : 1er Mai 2026</p>
      </div>

      <div className="prose prose-invert max-w-none space-y-8 text-text-secondary font-medium leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight text-white border-l-4 border-accent-green pl-4">1. Collecte des données</h2>
          <p>
            Nous collectons les informations que vous nous fournissez directement lors de la création de votre compte : nom, email, numéro de téléphone et photo de profil (facultatif).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight text-white border-l-4 border-accent-green pl-4">2. Utilisation des données</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Gérer vos réservations de terrains</li>
            <li>Vous permettre de rejoindre des matchs publics</li>
            <li>Vous envoyer des notifications importantes sur vos réservations</li>
            <li>Améliorer nos services et votre expérience utilisateur</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight text-white border-l-4 border-accent-green pl-4">3. Partage des données</h2>
          <p>
            Nous partageons uniquement les informations nécessaires avec les complexes sportifs que vous réservez (généralement votre nom et numéro de téléphone) pour la bonne gestion de votre session.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight text-white border-l-4 border-accent-green pl-4">4. Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données contre tout accès non autorisé ou toute perte.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight text-white border-l-4 border-accent-green pl-4">5. Vos droits</h2>
          <p>
            Conformément à la législation en vigueur, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Vous pouvez exercer ces droits depuis votre espace profil ou en nous contactant.
          </p>
        </section>
      </div>
    </div>
  );
}
