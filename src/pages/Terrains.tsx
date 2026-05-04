import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Search, 
  Star, 
  ChevronRight,
  RotateCcw
} from 'lucide-react';

import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { TerrainSkeleton } from '@/src/components/ui/Skeleton';
import { MOCK_TERRAINS } from '@/src/lib/mockData';
import { cn } from '@/src/lib/utils';
import { SEO } from '@/src/components/layout/SEO';

const FILTER_OPTIONS = [
  "Tous les types",
  "6 vs 6",
  "7 vs 7",
  "Disponible maintenant",
  "Moins de 10 DT",
  "Bien noté (4+)"
];

export default function Terrains() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFilters, setActiveFilters] = React.useState<string[]>(['Tous les types']);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [activeFilters, searchQuery]);

  const toggleFilter = (filter: string) => {
    setIsLoading(true);
    if (filter === "Tous les types") {
      setActiveFilters(['Tous les types']);
      return;
    }
    setActiveFilters(prev => {
      const next = prev.filter(f => f !== "Tous les types");
      if (next.includes(filter)) {
        const filtered = next.filter(f => f !== filter);
        return filtered.length === 0 ? ['Tous les types'] : filtered;
      }
      return [...next, filter];
    });
  };

  const filteredTerrains = MOCK_TERRAINS.filter(terrain => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = terrain.name.toLowerCase().includes(query) || 
                         terrain.city.toLowerCase().includes(query) || 
                         terrain.complex_name.toLowerCase().includes(query);
    
    if (activeFilters.includes('Tous les types')) return matchesSearch;
    
    const matchesType = (activeFilters.includes('6 vs 6') && terrain.type === '6v6') || 
                       (activeFilters.includes('7 vs 7') && terrain.type === '7v7') ||
                       (!activeFilters.includes('6 vs 6') && !activeFilters.includes('7 vs 7'));
    
    const matchesAvailable = activeFilters.includes('Disponible maintenant') ? terrain.available : true;
    const matchesRating = activeFilters.includes('Bien noté (4+)') ? terrain.rating >= 4 : true;
    
    return matchesSearch && matchesType && matchesAvailable && matchesRating;
  });

  return (
    <div className="flex flex-col md:pt-20 bg-background-primary">
      <SEO title="Trouve ton terrain | Takwira.com" />
      {/* Top Search & Filter Bar */}
      <div className="sticky top-0 md:top-20 z-30 bg-white border-b border-border-subtle p-4 pb-2 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="relative group flex items-center">
            <Search className="absolute left-4 text-text-secondary group-focus-within:text-pl-purple transition-colors" size={20} />
            <Input 
              value={searchQuery}
              onChange={(e) => {
                setIsLoading(true);
                setSearchQuery(e.target.value);
              }}
              className="pl-12 h-14 text-lg bg-background-primary border-border-subtle focus:border-pl-purple shadow-sm" 
              placeholder="Chercher par ville, quartier ou complexe..." 
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 border",
                  activeFilters.includes(filter) 
                    ? "bg-pl-purple text-white border-pl-purple shadow-pl" 
                    : "bg-white text-text-secondary border-border-subtle hover:border-pl-purple"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-1 relative">
        {/* Main Panel: Search Results */}
        <div className="w-full flex flex-col bg-background-primary">
          <div className="px-4 md:px-8 py-6">
            <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto w-full">
              <h2 className="text-2xl font-display uppercase font-bold tracking-tight">
                <span className="text-pl-purple">{filteredTerrains.length}</span> terrains trouvés
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-text-secondary font-bold uppercase tracking-widest text-[10px]">Trier par :</span>
                <select className="bg-white border border-border-subtle rounded-lg px-2 py-1 text-text-primary focus:outline-none focus:border-pl-purple font-bold text-xs uppercase">
                  <option>Disponibilité</option>
                  <option>Note</option>
                  <option>Prix</option>
                </select>
              </div>
            </div>

            <div className="max-w-7xl mx-auto w-full pb-20">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {[1, 2, 3, 4, 5, 6].map(i => <TerrainSkeleton key={i} />)}
                  </motion.div>
                ) : filteredTerrains.length > 0 ? (
                  <motion.div 
                    key="results"
                    initial="hidden"
                    animate="show"
                    variants={{
                      show: { transition: { staggerChildren: 0.08 } }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filteredTerrains.map((terrain) => (
                      <motion.div
                        key={terrain.id}
                        variants={{
                          hidden: { y: 20, opacity: 0 },
                          show: { y: 0, opacity: 1 }
                        }}
                      >
                        <Card className="overflow-hidden hover:border-pl-purple hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full bg-white border-border-subtle shadow-pl">
                          <div className="h-48 w-full shrink-0 relative overflow-hidden shadow-sm border-b border-border-subtle">
                            <img 
                              src={terrain.photos[0]} 
                              alt={terrain.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3">
                              <Badge variant="purple" className="shadow-md">
                                {terrain.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="text-xl font-display font-bold uppercase truncate text-pl-purple">{terrain.name}</h3>
                                <div className="flex items-center gap-1 shrink-0 bg-white border border-border-subtle px-2 py-0.5 rounded-lg">
                                  <Star size={14} className="fill-orange-400 text-orange-400" />
                                  <span className="text-sm font-bold text-pl-purple">{terrain.rating}</span>
                                </div>
                              </div>
                              <p className="text-text-secondary text-sm font-sans mb-4 flex items-center gap-1">
                                <MapPin size={14} className="text-text-muted" />
                                {terrain.complex_name} • {terrain.city}
                              </p>
                              
                              <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="outline" className="text-[10px] uppercase font-bold py-0">{terrain.city}</Badge>
                                {terrain.available && <Badge variant="success" className="text-[10px] uppercase font-bold py-0">Ouvert</Badge>}
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-4 border-t border-border-subtle">
                              <div className="flex items-center gap-1">
                                <div className={cn("h-2 w-2 rounded-full", terrain.available ? "bg-pl-green" : "bg-red-500")} />
                                <span className={cn("text-[10px] font-bold uppercase tracking-wider", terrain.available ? "text-pl-purple" : "text-red-500")}>
                                  {terrain.available ? "Disponible" : "Complet"}
                                </span>
                              </div>
                              <Button 
                                size="sm" 
                                className="h-9 gap-2 bg-pl-purple text-white hover:bg-pl-purple-dark text-[10px]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/terrains/${terrain.id}`);
                                }}
                              >
                                Réserver <ChevronRight size={16} />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-20 flex flex-col items-center text-center px-4"
                  >
                    <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center mb-8 border border-border-subtle relative shadow-sm">
                       <RotateCcw size={80} className="text-pl-purple/10" />
                       <div className="absolute inset-0 flex items-center justify-center animate-bounce">
                          <MapPin size={40} className="text-pl-purple" />
                       </div>
                    </div>
                    <h3 className="text-3xl font-display font-bold mb-2 uppercase text-pl-purple">Aucun terrain trouvé</h3>
                    <p className="text-text-secondary font-sans max-w-sm mb-8">
                      Essaie de modifier tes filtres ou cherche dans une autre ville.
                    </p>
                    <Button variant="outline" className="border-pl-purple text-pl-purple hover:bg-pl-purple hover:text-white" onClick={() => {
                      setIsLoading(true);
                      setSearchQuery('');
                      setActiveFilters(['Tous les types']);
                    }}>
                      Réinitialiser les filtres
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
