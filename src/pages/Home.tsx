import * as React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Counter } from '@/src/components/ui/Counter';
import { MOCK_COMPLEXES } from '@/src/lib/mockData';
import { 
  Users, 
  MapPin, 
  ChevronRight, 
  CalendarCheck, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  AppWindow,
  Star,
  ChevronDown
} from 'lucide-react';
import { SEO } from '@/src/components/layout/SEO';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function Home() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <div className="flex flex-col overflow-x-hidden">
      <SEO />
      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pb-12">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <motion.img
            style={{ y: heroY, opacity: heroOpacity }}
            src="https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&q=80&w=2000"
            alt="Football pitch night"
            className="h-full w-full object-cover scale-110"
          />
          <div className="absolute inset-0 bg-white/85 z-10" />
        </div>

        {/* Animated Background Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pl-purple/5 rounded-full blur-[120px] animate-pulse z-10" />

        <div className="relative z-20 text-center px-4 max-w-5xl py-12">

          <h1 className="flex flex-col text-6xl md:text-[100px] font-display font-extrabold mb-8 leading-[0.85] tracking-tighter text-pl-purple">
            <motion.span
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              ORGANISE.
            </motion.span>
            <motion.span
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              RÉSERVE.
            </motion.span>
            <motion.span
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-pl-pink"
            >
              JOUE.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto font-sans font-medium"
          >
            La plateforme qui connecte les joueurs et les terrains de foot en Tunisie.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg" 
              className="text-lg min-w-[220px] bg-pl-purple hover:bg-pl-purple-dark"
              onClick={() => navigate('/terrains')}
            >
              Trouver un Terrain <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg min-w-[220px] border-pl-purple text-pl-purple hover:bg-pl-purple hover:text-white"
              onClick={() => navigate('/inscription-gerant')}
            >
              Gérer mon Complexe
            </Button>
          </motion.div>

        </div>

        {/* Scroll Down Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-pl-purple"
        >
          <ChevronDown size={32} />
        </motion.div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 bg-[#faf9fa] relative border-y border-border-subtle">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4 text-pl-purple">COMMENT ÇA MARCHE</h2>
          <p className="text-text-secondary text-lg font-sans">Trois étapes simples pour organiser ton match</p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative"
        >
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-[40%] left-[15%] right-[15%] h-0.5 bg-pl-purple/10 -translate-y-1/2 z-0 overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="h-full bg-pl-purple origin-left"
            />
          </div>

          {[
            { step: "1", icon: MapPin, title: "Trouve ton Terrain", text: "Parcours les meilleurs complexes de Tunisie filtrés par ville et type de terrain." },
            { step: "2", icon: CalendarCheck, title: "Réserve ton Créneau", text: "Choisis l'heure qui te convient et paye en ligne ou directement au complexe." },
            { step: "3", icon: Users, title: "Joue avec tes Amis", text: "Partage le lien du match, invite tes joueurs et profite d'une partie légendaire." }
          ].map((item, i) => (
            <motion.div key={i} variants={item as any} className="relative z-10">
              <Card className="h-full flex flex-col items-center text-center p-8 bg-white border-border-subtle shadow-sm group hover:border-pl-purple transition-colors">
                <span className="absolute -top-4 right-4 text-[120px] font-display font-extrabold text-pl-purple/5 leading-none pointer-events-none select-none transition-all duration-500 group-hover:text-pl-pink/20 group-hover:scale-110 group-hover:-translate-y-2">
                  {item.step}
                </span>
                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-pl-purple mb-6 border-2 border-pl-purple/10 group-hover:bg-pl-purple group-hover:text-white transition-colors duration-300">
                  <item.icon size={32} />
                </div>
                <h3 className="text-2xl mb-4 font-display font-bold uppercase tracking-tight text-pl-purple">{item.title}</h3>
                <p className="text-text-secondary font-sans leading-relaxed">{item.text}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* SECTION 3: FEATURED TERRAINS */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl mb-2 text-pl-purple">TERRAINS <span className="text-pl-pink">POPULAIRES</span></h2>
            <p className="text-text-secondary text-lg font-sans">Réserve ton terrain dans les meilleurs complexes</p>
          </div>
          <Link to="/terrains" className="text-pl-purple font-sans font-bold flex items-center gap-1 hover:gap-2 transition-all uppercase text-sm tracking-widest">
            Voir tous les terrains <ChevronRight size={20} />
          </Link>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto pb-8 gap-6 no-scrollbar snap-x snap-mandatory px-2">
            {MOCK_COMPLEXES.slice(0, 4).map((complex, i) => (
              <motion.div
                key={complex.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="min-w-[280px] md:min-w-[380px] snap-start"
              >
                <Card className="p-0 overflow-hidden group cursor-pointer h-full border-border-subtle shadow-md" onClick={() => navigate(`/terrains/${complex.id}`)}>
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={complex.photos[0]}
                      alt={complex.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pl-purple/90 via-pl-purple/20 to-transparent" />
                    
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge variant="purple" className="text-[10px]">
                        {i % 2 === 0 ? '6VS6' : '7VS7'}
                      </Badge>
                      <Badge variant={i === 2 ? 'danger' : 'green'} className="text-[10px]">
                        {i === 2 ? 'Complet' : 'Disponible'}
                      </Badge>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <Button 
                        className="pointer-events-auto bg-pl-purple hover:bg-pl-purple-dark text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/terrains/${complex.id}`);
                        }}
                      >
                        Voir & Réserver
                      </Button>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5">
                      <h3 className="text-2xl font-display font-bold text-white mb-1 uppercase tracking-tight">{complex.name}</h3>
                      <div className="flex items-center gap-1 text-white/80 text-sm">
                        <MapPin size={14} className="text-pl-green" />
                        <span>{complex.city}, Tunisie</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="fill-orange-400 text-orange-400" />
                      <span className="font-bold text-sm text-pl-purple">{complex.rating}</span>
                      <span className="text-text-muted text-xs">({(Math.random() * 50 + 10).toFixed(0)} avis)</span>
                    </div>
                    <span className="text-pl-purple font-display font-bold text-xl">DÈS 12 DT</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: PLAYERS VS MANAGERS */}
      <section className="grid grid-cols-1 md:grid-cols-2 border-y border-border-subtle">
        {/* For Players */}
        <div className="bg-white p-12 md:p-24 flex flex-col justify-center items-start border-b md:border-b-0 md:border-r border-border-subtle">
          <div className="h-16 w-16 bg-pl-purple/5 rounded-2xl flex items-center justify-center text-pl-purple mb-8 border border-pl-purple/10">
            <Users size={40} />
          </div>
          <h2 className="text-5xl md:text-6xl mb-6 font-display font-extrabold uppercase text-pl-purple">POUR LES <span className="text-pl-pink">JOUEURS</span></h2>
          <ul className="space-y-4 mb-10">
            {[
              "Trouver des matchs près de toi",
              "Rejoindre un match via lien ou QR Code",
              "Confirmer ta présence en un tap",
              "Voir tes équipes générées automatiquement",
              "Historique de tous tes matchs"
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-text-primary/90 font-sans font-medium">
                <CheckCircle2 size={24} className="text-pl-purple shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button 
            size="lg" 
            className="w-full md:w-auto min-w-[240px] bg-pl-purple hover:bg-pl-purple-dark text-white"
            onClick={() => navigate('/connexion')}
          >
            Créer un compte Joueur
          </Button>
        </div>

        {/* For Managers */}
        <div className="bg-[#faf9fa] p-12 md:p-24 flex flex-col justify-center items-start">
          <div className="h-16 w-16 bg-pl-pink/5 rounded-2xl flex items-center justify-center text-pl-pink mb-8 border border-pl-pink/10">
            <Building2 size={40} />
          </div>
          <h2 className="text-5xl md:text-6xl mb-6 font-display font-extrabold uppercase text-pl-purple">POUR LES <span className="text-pl-purple">GÉRANTS</span></h2>
          <ul className="space-y-4 mb-10">
            {[
              "Gérer tous tes terrains depuis un dashboard",
              "Accepter les réservations en ligne",
              "Gérer tes académies et abonnements",
              "Planifier les créneaux récurrents",
              "Voir les contacts de tes réservants"
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-text-primary/90 font-sans font-medium">
                <CheckCircle2 size={24} className="text-pl-pink shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full md:w-auto min-w-[240px] border-pl-purple text-pl-purple hover:bg-pl-purple hover:text-white"
            onClick={() => navigate('/inscription-gerant')}
          >
            Enregistrer mon Complexe
          </Button>
        </div>
      </section>

      {/* SECTION 5: LIVE STATS */}
      <section className="py-24 px-6 md:px-12 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-pl-purple/2 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <Counter value={150} suffix="+" className="block text-6xl md:text-8xl font-display font-extrabold text-pl-purple mb-2" />
            <span className="text-text-secondary text-sm md:text-base font-sans font-bold uppercase tracking-widest">Terrains partenaires</span>
          </div>
          <div>
            <Counter value={5200} suffix="+" className="block text-6xl md:text-8xl font-display font-extrabold text-pl-pink mb-2" />
            <span className="text-text-secondary text-sm md:text-base font-sans font-bold uppercase tracking-widest">Matchs organisés</span>
          </div>
          <div>
            <Counter value={12000} suffix="+" className="block text-6xl md:text-8xl font-display font-extrabold text-pl-cyan mb-2" />
            <span className="text-text-secondary text-sm md:text-base font-sans font-bold uppercase tracking-widest">Joueurs actifs</span>
          </div>
        </div>
      </section>

      {/* SECTION 6: APP DOWNLOAD */}
      <section className="py-32 px-6 text-center bg-[#faf9fa] overflow-hidden relative border-t border-border-subtle">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-pl-purple/5 blur-[150px] -z-0" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <Badge variant="purple" className="mb-6">MOBILE FIRST</Badge>
          <h2 className="text-5xl md:text-7xl mb-6 font-display font-extrabold tracking-tighter text-pl-purple">DISPONIBLE SUR <span className="text-pl-pink">MOBILE</span></h2>
          <p className="text-text-secondary text-xl mb-12 max-w-xl mx-auto font-sans">
            Garde le contrôle de tes matchs où que tu sois. Télécharge l'application Takwira gratuitement.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="flex items-center gap-4 bg-white border border-border-subtle p-4 pr-10 rounded-2xl hover:border-pl-purple hover:shadow-xl transition-all group min-w-[240px]">
               <div className="h-12 w-12 bg-pl-purple/5 rounded-xl flex items-center justify-center text-pl-purple group-hover:bg-pl-purple group-hover:text-white transition-colors">
                  <AppWindow size={32} />
               </div>
               <div className="text-left">
                  <span className="text-[10px] text-text-muted block font-bold uppercase tracking-widest">Disponible sur</span>
                  <span className="text-lg font-bold block leading-none text-pl-purple">App Store</span>
               </div>
            </button>
            <button className="flex items-center gap-4 bg-white border border-border-subtle p-4 pr-10 rounded-2xl hover:border-pl-purple hover:shadow-xl transition-all group min-w-[240px]">
               <div className="h-12 w-12 bg-pl-purple/5 rounded-xl flex items-center justify-center text-pl-purple group-hover:bg-pl-purple group-hover:text-white transition-colors">
                  <PlayIcon />
               </div>
               <div className="text-left">
                  <span className="text-[10px] text-text-muted block font-bold uppercase tracking-widest">Disponible sur</span>
                  <span className="text-lg font-bold block leading-none text-pl-purple">Google Play</span>
               </div>
            </button>
          </div>
        </div>
      </section>
      
      {/* Spacer for bottom nav if mobile */}
      <div className="h-20 md:hidden" />
    </div>
  );
}

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L18.66,16.19C19.8,16.85 19.8,18.15 18.66,18.81L7.07,25.5L15.39,17.18M23.1,13.6L20.3,15.18L17.74,12.63L20.3,10.82L23.1,12.4C23.9,12.85 23.9,13.15 23.1,13.6M15.39,6.82L7.07,15.5L18.66,2.19C19.8,2.85 19.8,4.15 18.66,4.81L16.81,5.88" />
  </svg>
);

