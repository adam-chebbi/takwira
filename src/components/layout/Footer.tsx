import { NavLink, Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-border-subtle pt-16 pb-32 md:pb-16 px-6 hidden md:block">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center group mb-4 block" aria-label="Takwira.com Home">
            <span className="text-3xl font-display font-black tracking-tighter text-pl-purple">TAKWIRA</span>
            <span className="text-3xl font-display font-black tracking-tighter text-pl-pink">.</span>
          </Link>
          <p className="text-text-secondary text-sm">
            La première plateforme en Tunisie pour les passionnés de football. Organisez et jouez sans limites.
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-pl-purple">Navigation</h4>
          <ul className="space-y-4 text-text-secondary text-sm">
            <li><NavLink to="/terrains" className="hover:text-pl-purple transition-colors">Nos Terrains</NavLink></li>
            <li><NavLink to="/matches" className="hover:text-pl-purple transition-colors">Matchs Ouverts</NavLink></li>
            <li><NavLink to="/blog" className="hover:text-pl-purple transition-colors">Blog</NavLink></li>
            <li><NavLink to="/inscription-gerant" className="hover:text-pl-purple transition-colors">Enregistrer un Complexe</NavLink></li>
            <li><NavLink to="/tournaments" className="hover:text-pl-purple transition-colors">Tournois</NavLink></li>
            <li><NavLink to="/academies" className="hover:text-pl-purple transition-colors">Académies</NavLink></li>
            <li><NavLink to="/a-propos" className="hover:text-pl-purple transition-colors">À Propos</NavLink></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-pl-purple">Support</h4>
          <ul className="space-y-4 text-text-secondary text-sm">
            <li><NavLink to="/aide" className="hover:text-pl-purple transition-colors">Centre d'aide</NavLink></li>
            <li><NavLink to="/terms" className="hover:text-pl-purple transition-colors">Conditions d'utilisation</NavLink></li>
            <li><NavLink to="/privacy" className="hover:text-pl-purple transition-colors">Politique de confidentialité</NavLink></li>
            <li><NavLink to="/contact" className="hover:text-pl-purple transition-colors">Contact</NavLink></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-pl-purple">Newsletter</h4>
          <p className="text-text-secondary text-sm mb-4">Recevez les nouveaux terrains et tournois en exclusivité.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Email" 
              className="bg-background-primary border border-border-subtle rounded-lg px-3 py-2 text-xs w-full focus:outline-none focus:border-pl-purple"
            />
            <button className="bg-pl-purple text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-pl-purple-dark transition-colors">Go</button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-text-secondary text-xs">© 2026 Takwira.com. Tous droits réservés.</p>
        <div className="flex gap-6">
          <a href="#" className="text-text-secondary hover:text-pl-purple text-xs transition-colors font-bold uppercase tracking-widest">Instagram</a>
          <a href="#" className="text-text-secondary hover:text-pl-purple text-xs transition-colors font-bold uppercase tracking-widest">Facebook</a>
          <a href="#" className="text-text-secondary hover:text-pl-purple text-xs transition-colors font-bold uppercase tracking-widest">TikTok</a>
        </div>
      </div>
    </footer>
  );
};
