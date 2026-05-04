import * as React from 'react';

export default function Terms() {
  return (
    <div className="pt-40 pb-20 px-6 md:px-12 max-w-4xl mx-auto space-y-12">
      <div className="space-y-4">
        <h1 className="text-5xl font-display font-black uppercase tracking-tight text-pl-purple">Conditions d'utilisation</h1>
        <p className="text-text-tertiary text-sm font-black uppercase tracking-widest">Dernière mise à jour : 1er Mai 2026</p>
      </div>

      <div className="prose max-w-none space-y-8 text-text-secondary font-medium leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight text-pl-purple border-l-4 border-accent-green pl-4">1. Acceptation des conditions</h2>
          <p>
            En accédant et en utilisant la plateforme Takwira.com, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight text-pl-purple border-l-4 border-accent-green pl-4">2. Description du service</h2>
          <p>
            Takwira.com est une plateforme de mise en relation entre joueurs de football et complexes sportifs en Tunisie. Nous facilitons la réservation de terrains et l'organisation de matchs publics ou privés.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight text-pl-purple border-l-4 border-accent-green pl-4">3. Comptes utilisateurs</h2>
          <p>
            Pour utiliser certaines fonctionnalités, vous devez créer un compte. Vous êtes responsable du maintien de la confidentialité de votre compte et de votre mot de passe, ainsi que de toutes les activités effectuées sous votre compte.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight text-pl-purple border-l-4 border-accent-green pl-4">4. Réservations et Annulations</h2>
          <p>
            Les conditions de réservation et d'annulation sont définies par chaque complexe sportif individuellement. Takwira.com agit en tant qu'intermédiaire et ne peut être tenu responsable des litiges entre joueurs et complexes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight text-pl-purple border-l-4 border-accent-green pl-4">5. Responsabilité</h2>
          <p>
            Takwira.com ne peut être tenu responsable des blessures physiques survenues lors de la pratique du sport dans les complexes partenaires. Chaque utilisateur pratique le football sous sa propre responsabilité.
          </p>
        </section>
      </div>
    </div>
  );
}
