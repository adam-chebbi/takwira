import { NavLink } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-background-secondary border-t border-border-subtle pt-16 pb-32 md:pb-16 px-6 hidden md:block">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <NavLink to="/" className="text-3xl font-display font-extrabold tracking-tighter text-accent-green mb-4 block">
            TAKWIRA<span className="text-text-primary">.COM</span>
          </NavLink>
          <p className="text-text-secondary text-sm">
            La première plateforme en Tunisie pour les passionnés de football. Organisez et jouez sans limites.
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-text-primary">Navigation</h4>
          <ul className="space-y-4 text-text-secondary text-sm">
            <li><NavLink to="/terrains" className="hover:text-accent-green transition-colors">Nos Terrains</NavLink></li>
            <li><NavLink to="/matches" className="hover:text-accent-green transition-colors">Matchs Ouverts</NavLink></li>
            <li><NavLink to="/blog" className="hover:text-accent-green transition-colors">Blog</NavLink></li>
            <li><NavLink to="/inscription-gerant" className="hover:text-accent-green transition-colors">Enregistrer un Complexe</NavLink></li>
            <li><NavLink to="/tournaments" className="hover:text-accent-green transition-colors">Tournois</NavLink></li>
            <li><NavLink to="/academies" className="hover:text-accent-green transition-colors">Académies</NavLink></li>
            <li><NavLink to="/a-propos" className="hover:text-accent-green transition-colors">À Propos</NavLink></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-text-primary">Support</h4>
          <ul className="space-y-4 text-text-secondary text-sm">
            <li><NavLink to="/aide" className="hover:text-accent-green transition-colors">Centre d'aide</NavLink></li>
            <li><NavLink to="/terms" className="hover:text-accent-green transition-colors">Conditions d'utilisation</NavLink></li>
            <li><NavLink to="/privacy" className="hover:text-accent-green transition-colors">Politique de confidentialité</NavLink></li>
            <li><NavLink to="/contact" className="hover:text-accent-green transition-colors">Contact</NavLink></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-text-primary">Newsletter</h4>
          <p className="text-text-secondary text-sm mb-4">Recevez les nouveaux terrains et tournois en exclusivité.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Email" 
              className="bg-background-card border border-border-subtle rounded-lg px-3 py-2 text-xs w-full focus:outline-none focus:border-accent-green"
            />
            <button className="bg-accent-green text-background-primary px-4 py-2 rounded-lg text-xs font-bold">Go</button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-text-secondary text-xs">© 2026 Takwira.com. Tous droits réservés.</p>
        <div className="flex gap-6">
          <a href="#" className="text-text-secondary hover:text-accent-green text-xs transition-colors">Instagram</a>
          <a href="#" className="text-text-secondary hover:text-accent-green text-xs transition-colors">Facebook</a>
          <a href="#" className="text-text-secondary hover:text-accent-green text-xs transition-colors">TikTok</a>
        </div>
      </div>
    </footer>
  );
};
