import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Star, 
  Map as MapIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  Check, 
  Car, 
  Coffee, 
  Users, 
  Wifi, 
  ShowerHead, 
  Lightbulb,
  ExternalLink,
  Calendar,
  Info,
  ChevronDown,
  User
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { cn } from '@/src/lib/utils';
import { MOCK_TERRAINS } from '@/src/lib/mockData';

// Mock expanded data for a single complex
const COMPLEX_DATA = {
  id: "complex-1",
  name: "Gammarth Foot Center",
  city: "Tunis",
  neighborhood: "Gammarth",
  isVerified: true,
  rating: 4.8,
  reviewCount: 124,
  description: "Le Gammarth Foot Center est l'un des complexes sportifs les plus modernes de la zone nord de Tunis. Nous proposons des terrains de haute qualité avec un gazon synthétique de dernière génération homologué par la FIFA. Que vous soyez un groupe d'amis ou une équipe corporative, notre centre offre toutes les commodités nécessaires pour une expérience footballistique exceptionnelle, incluant des vestiaires propres, une cafétéria avec vue sur les terrains et un parking sécurisé.",
  address: "Av. Habib Bourguiba, Gammarth 2070, Tunis",
  coordinates: [36.9189, 10.2882] as [number, number],
  amenities: [
    { id: 'vestiaires', icon: <ShowerHead size={20} />, label: 'Vestiaires', available: true },
    { id: 'eclairage', icon: <Lightbulb size={20} />, label: 'Éclairage', available: true },
    { id: 'parking', icon: <Car size={20} />, label: 'Parking', available: true },
    { id: 'wifi', icon: <Wifi size={20} />, label: 'WiFi', available: true },
    { id: 'buvette', icon: <Coffee size={20} />, label: 'Buvette', available: true },
    { id: 'tribune', icon: <Users size={20} />, label: 'Tribune', available: false },
  ],
  terrains: [
    { id: 't1', name: "Terrain 1", format: "6 vs 6", players: 12, type: "Synthétique" },
    { id: 't2', name: "Terrain 2", format: "7 vs 7", players: 14, type: "Synthétique" },
    { id: 't3', name: "Terrain 3", format: "5 vs 5", players: 10, type: "Synthétique" },
  ],
  photos: [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1529900748604-07564d02421a?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1526232759583-d6f44a004b4e?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2000&auto=format&fit=crop",
  ],
  reviews: [
    { id: 'r1', user: 'Ahmed S.', date: 'Il y a 2 jours', rating: 5, comment: "Excellent terrain, le gazon est tout neuf. L'accueil est chaleureux." },
    { id: 'r2', user: 'Sami K.', date: 'Il y a 1 semaine', rating: 4, comment: "Très bon complexe, un peu difficile d'accéder aux heures de pointe mais ça vaut le coup." },
    { id: 'r3', user: 'Yassine M.', date: 'Il y a 2 semaines', rating: 5, comment: "Meilleur spot pour jouer au foot à Gammarth sans aucun doute." },
  ],
  ratingStats: [
    { stars: 5, count: 85 },
    { stars: 4, count: 25 },
    { stars: 3, count: 10 },
    { stars: 2, count: 3 },
    { stars: 1, count: 1 },
  ]
};

// Scheduler component helpers
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 to 22:00
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// Leaflet map helpers
const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export default function TerrainDetail() {
  const { id } = useParams();
  const [activePhotoIndex, setActivePhotoIndex] = React.useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const [activeTerrainTab, setActiveTerrainTab] = React.useState(COMPLEX_DATA.terrains[0].id);
  const [selectedSlot, setSelectedSlot] = React.useState<{ date: string, time: string, terrainId: string } | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false);
  const [isReservationSheetOpen, setIsReservationSheetOpen] = React.useState(false);
  
  // Custom marker icon
  const customIcon = React.useMemo(() => {
    return new L.DivIcon({
      className: 'custom-div-icon',
      html: `<div class="w-10 h-10 bg-accent-green rounded-full border-2 border-background-primary flex items-center justify-center shadow-lg shadow-accent-green/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/><path d="m12 2 3.5 3.5"/><path d="M12 22v-4.5"/><path d="m15.5 17.5-3.5 3.5"/><path d="m12 12.5 3.5-3.5"/><path d="m8.5 17.5 3.5-3.5"/><path d="M12 7.5V12"/><path d="M22 12h-4.5"/><path d="M6.5 12 2 12"/><path d="m15.5 6.5 4.5 4.5"/><path d="m4 11 4.5-4.5"/></svg>
            </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }, []);

  // Handle slot selection
  const handleSlotClick = (dayIndex: number, hour: number) => {
    // In a real app, check if slot is available
    const timeString = `${hour}:00`;
    const dateString = `${DAYS[dayIndex]} 22 Mai`; // Simple mock date logic
    
    if (selectedSlot?.time === timeString && selectedSlot?.date === dateString) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot({
        date: dateString,
        time: timeString,
        terrainId: activeTerrainTab
      });
    }
  };

  const getSlotStatus = (dayIndex: number, hour: number) => {
    // Mock random status for visualization
    const seed = (dayIndex * 24 + hour) % 10;
    if (seed < 5) return 'available';
    if (seed < 7) return 'reserved';
    if (seed < 8) return 'recurring';
    return 'closed';
  };

  return (
    <div className="min-h-screen pt-24 pb-32 md:pb-12 bg-background-primary overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8 relative items-start">
          
          {/* Left Column (60%) */}
          <div className="w-full md:w-[60%] space-y-12">
            
            {/* Photo Gallery */}
            <section className="space-y-4">
              <div className="relative h-[220px] md:h-[400px] w-full rounded-2xl overflow-hidden group shadow-2xl border border-border-subtle">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activePhotoIndex}
                    src={COMPLEX_DATA.photos[activePhotoIndex]} 
                    alt={COMPLEX_DATA.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                
                <button 
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute top-4 right-4 bg-background-primary/60 backdrop-blur-md p-2 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Maximize2 size={20} />
                </button>
              </div>

              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {COMPLEX_DATA.photos.map((photo, index) => (
                  <button 
                    key={index}
                    onClick={() => setActivePhotoIndex(index)}
                    className={cn(
                      "relative h-16 md:h-24 w-24 md:w-32 shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                      activePhotoIndex === index ? "border-accent-green scale-105" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </section>

            {/* Complex Header */}
            <section>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl font-display uppercase font-extrabold tracking-tighter leading-none">
                    {COMPLEX_DATA.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-text-secondary">
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span className="text-sm font-medium">{COMPLEX_DATA.city}, {COMPLEX_DATA.neighborhood}</span>
                    </div>
                    {COMPLEX_DATA.isVerified && (
                      <div className="flex items-center gap-1.5 bg-accent-green/10 text-accent-green px-2 py-0.5 rounded-full border border-accent-green/20">
                        <Check size={12} strokeWidth={3} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Vérifié</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5 text-warning">
                        <Star size={14} className="fill-current" />
                        <span className="text-sm font-bold text-text-primary ml-1">{COMPLEX_DATA.rating}</span>
                      </div>
                      <span className="text-xs">({COMPLEX_DATA.reviewCount} avis)</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="flex gap-2 h-11 px-6 font-bold"
                  onClick={() => window.open(`https://www.openstreetmap.org/search?query=${encodeURIComponent(COMPLEX_DATA.address)}`, '_blank')}
                >
                  <MapIcon size={18} /> Itinéraire
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Badge variant="primary" className="py-1 px-4 text-xs font-bold uppercase tracking-wide">
                  {COMPLEX_DATA.terrains.length} terrains
                </Badge>
                <Badge variant="outline" className="py-1 px-4 text-xs font-bold uppercase tracking-wide">
                  Synthétique
                </Badge>
                <div className="flex items-center gap-2 bg-background-secondary px-4 py-1.5 rounded-full border border-border-subtle text-xs font-medium">
                  <Clock size={14} className="text-accent-green" />
                  08:00 - 00:00
                </div>
              </div>
            </section>

            {/* Terrain Selector Tabs */}
            <section className="border-b border-border-subtle">
              <div className="flex gap-8 overflow-x-auto no-scrollbar">
                {COMPLEX_DATA.terrains.map((terrain) => (
                  <button
                    key={terrain.id}
                    onClick={() => setActiveTerrainTab(terrain.id)}
                    className={cn(
                      "pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
                      activeTerrainTab === terrain.id 
                        ? "text-accent-green" 
                        : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    {terrain.name} · {terrain.format}
                    {activeTerrainTab === terrain.id && (
                      <motion.div 
                        layoutId="activeTab" 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-green" 
                      />
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Availability Schedule */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display uppercase font-bold tracking-tight">Disponibilités</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <ChevronLeft size={18} />
                  </Button>
                  <span className="text-xs font-bold uppercase px-2 font-sans">Semaine du 19 Mai</span>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </div>

              <div className="bg-background-secondary rounded-2xl border border-border-subtle overflow-hidden">
                <div className="grid grid-cols-7 border-b border-border-subtle bg-background-card/50">
                  {DAYS.map((day, i) => (
                    <div key={day} className="py-4 text-center border-r border-border-subtle last:border-r-0">
                      <span className="block text-[10px] uppercase font-bold text-text-secondary mb-1">{day}</span>
                      <span className="block text-lg font-display font-bold">{19 + i}</span>
                    </div>
                  ))}
                </div>
                
                <div className="h-[400px] overflow-y-auto no-scrollbar relative">
                  <div className="grid grid-cols-7 h-full">
                    {DAYS.map((_, dayIdx) => (
                      <div key={dayIdx} className="border-r border-border-subtle last:border-r-0 flex flex-col">
                        {HOURS.map((hour) => {
                          const status = getSlotStatus(dayIdx, hour);
                          const isSelected = selectedSlot?.time === `${hour}:00` && selectedSlot?.date.includes(DAYS[dayIdx]);
                          
                          return (
                            <button
                              key={hour}
                              onClick={() => status === 'available' && handleSlotClick(dayIdx, hour)}
                              disabled={status !== 'available'}
                              className={cn(
                                "h-12 w-full border-b border-border-subtle flex items-center justify-center transition-all relative group",
                                status === 'available' && "hover:scale-[1.05] hover:z-10 hover:shadow-xl",
                                status === 'available' && isSelected && "bg-accent-green/20 border-accent-green z-10",
                                status === 'available' && !isSelected && "bg-accent-green/10 hover:bg-accent-green/30",
                                status === 'reserved' && "bg-danger/10 cursor-not-allowed",
                                status === 'recurring' && "bg-warning/10 cursor-not-allowed",
                                status === 'closed' && "bg-background-primary opacity-20 cursor-not-allowed"
                              )}
                            >
                              <span className={cn(
                                "text-[10px] font-bold",
                                status === 'available' && "text-accent-green",
                                status === 'reserved' && "text-danger",
                                status === 'recurring' && "text-warning",
                                isSelected && "scale-110"
                              )}>
                                {hour}:00
                              </span>
                              {isSelected && (
                                <div className="absolute inset-0 border-2 border-accent-green pointer-events-none rounded-sm shadow-[0_0_15px_rgba(0,255,135,0.3)]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-accent-green/10 border border-accent-green/20" />
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Libre</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-danger/10 border border-danger/20" />
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Réservé</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-warning/10 border border-warning/20" />
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Récurrent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-background-primary border border-border-subtle" />
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Fermé</span>
                </div>
              </div>

              {/* Slot Summary */}
              {selectedSlot && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-accent-green/10 border-l-4 border-accent-green p-4 rounded-xl flex items-center gap-4 mb-8"
                >
                  <div className="bg-accent-green p-2 rounded-lg text-black">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider text-accent-green">Créneau sélectionné</h4>
                    <p className="text-text-primary text-sm font-medium">
                      {selectedSlot.date} · {selectedSlot.time} - {parseInt(selectedSlot.time) + 1}:00 · Terrain {activeTerrainTab.replace('t', '')}
                    </p>
                  </div>
                </motion.div>
              )}
            </section>

            {/* Description */}
            <section className="space-y-4">
              <h2 className="text-2xl font-display uppercase font-bold tracking-tight">Description</h2>
              <div className="relative">
                <motion.p 
                  initial={false}
                  animate={{ height: isDescriptionExpanded ? 'auto' : '4.5rem' }}
                  className="text-text-secondary leading-relaxed font-sans overflow-hidden"
                >
                  {COMPLEX_DATA.description}
                </motion.p>
                {!isDescriptionExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background-primary to-transparent" />
                )}
              </div>
              <button 
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-accent-green font-bold text-sm uppercase tracking-widest hover:gap-2 flex items-center transition-all"
              >
                {isDescriptionExpanded ? "Lire moins" : "Lire plus"} <ChevronDown size={14} className={cn("ml-1 transition-transform", isDescriptionExpanded && "rotate-180")} />
              </button>
            </section>

            {/* Amenities */}
            <section className="space-y-6">
              <h2 className="text-2xl font-display uppercase font-bold tracking-tight">Équipements</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {COMPLEX_DATA.amenities.map((item) => (
                  <div key={item.id} className={cn(
                    "flex items-center gap-3 transition-opacity",
                    !item.available && "opacity-40"
                  )}>
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center border",
                      item.available ? "bg-accent-green/10 border-accent-green/20 text-accent-green" : "bg-background-secondary border-border-subtle text-text-secondary"
                    )}>
                      {item.icon}
                    </div>
                    <span className={cn(
                      "text-sm font-bold uppercase tracking-wider",
                      item.available ? "text-text-primary" : "text-text-secondary line-through"
                    )}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Localisation */}
            <section className="space-y-6">
              <h2 className="text-2xl font-display uppercase font-bold tracking-tight">Localisation</h2>
              <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-border-subtle shadow-inner z-0">
                <MapContainer 
                  center={COMPLEX_DATA.coordinates} 
                  zoom={15} 
                  className="h-full w-full"
                  zoomControl={false}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                    attribution='&copy; CARTO'
                  />
                  <Marker position={COMPLEX_DATA.coordinates} icon={customIcon} />
                  <ChangeView center={COMPLEX_DATA.coordinates} zoom={15} />
                </MapContainer>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="text-accent-green shrink-0 mt-1" size={20} />
                  <p className="text-text-secondary font-sans leading-tight">
                    {COMPLEX_DATA.address}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2 h-10"
                  onClick={() => window.open(`https://www.openstreetmap.org/search?query=${encodeURIComponent(COMPLEX_DATA.address)}`, '_blank')}
                >
                   <ExternalLink size={16} /> Google Maps
                </Button>
              </div>
            </section>

            {/* Reviews Section */}
            <section className="space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display uppercase font-bold tracking-tight">Avis des joueurs</h2>
                <Button className="bg-accent-green/10 text-accent-green border border-accent-green/20 hover:bg-accent-green hover:text-black">
                  Laisser un avis
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                <div className="space-y-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-7xl font-display font-extrabold text-accent-green">{COMPLEX_DATA.rating}</span>
                    <span className="text-2xl text-text-secondary font-display font-bold">/5</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                       <Star key={star} size={24} className={cn("fill-current", star <= 4.8 ? "text-warning" : "text-border-subtle")} />
                    ))}
                  </div>
                  <p className="text-text-secondary font-sans">Basé sur {COMPLEX_DATA.reviewCount} avis vérifiés</p>
                </div>

                <div className="space-y-3 w-full">
                  {COMPLEX_DATA.ratingStats.map((stat) => (
                    <div key={stat.stars} className="flex items-center gap-4">
                      <span className="text-xs font-bold w-4">{stat.stars}</span>
                      <div className="flex-1 h-2 bg-background-secondary rounded-full overflow-hidden border border-border-subtle">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(stat.count / 124) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-accent-green"
                        />
                      </div>
                      <span className="text-xs text-text-secondary w-8 text-right font-medium">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6 divide-y divide-border-subtle">
                {COMPLEX_DATA.reviews.map((review) => (
                  <div key={review.id} className="pt-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-background-card flex items-center justify-center text-accent-green font-bold text-sm border border-border-subtle">
                          {review.user.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm uppercase tracking-wider">{review.user}</h4>
                          <p className="text-[10px] text-text-secondary">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                           <Star key={s} size={12} className={cn("fill-current", s <= review.rating ? "text-warning" : "text-border-subtle")} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm font-sans text-text-secondary leading-relaxed">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="text-center pt-4">
                <Button variant="outline" className="px-8 h-12 uppercase font-bold tracking-widest text-xs">
                  Voir plus d'avis
                </Button>
              </div>
            </section>
          </div>

          {/* Right Column (40%) - Sticky Reservation Widget */}
          <div className="hidden md:block w-[40%] sticky top-32">
            <Card className="p-8 space-y-8 bg-background-card border-border-subtle shadow-2xl relative overflow-hidden">
               {/* Decorative background element */}
               <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-green/5 blur-3xl rounded-full" />
               
               <h3 className="text-2xl font-display font-extrabold uppercase tracking-tight relative">
                 Réserver un créneau
               </h3>

               {selectedSlot ? (
                 <div className="space-y-6 relative">
                    <div className="bg-background-secondary rounded-xl p-4 border border-accent-green/30 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-green" />
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] uppercase font-extra-bold text-accent-green tracking-widest">Terrain sélectionné</span>
                        <button onClick={() => setSelectedSlot(null)} className="text-text-secondary hover:text-danger">
                          <X size={14} />
                        </button>
                      </div>
                      <p className="text-lg font-display font-bold uppercase mb-1">Terrain {selectedSlot.terrainId.replace('t', '')} · {selectedSlot.terrainId === 't1' ? '6vs6' : selectedSlot.terrainId === 't2' ? '7vs7' : '5vs5'}</p>
                      <p className="text-sm font-medium text-text-secondary">{selectedSlot.date} @ {selectedSlot.time}</p>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-text-secondary">Format</span>
                          <span className="font-bold uppercase tracking-wider">{selectedSlot.terrainId === 't1' ? '6 vs 6' : selectedSlot.terrainId === 't2' ? '7 vs 7' : '5 vs 5'}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-text-secondary">Durée</span>
                          <span className="font-bold uppercase tracking-wider">60 Minutes</span>
                       </div>
                       <div className="pt-4 border-t border-border-subtle flex justify-between items-end">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-text-secondary block mb-1">Prix total</span>
                            <span className="text-3xl font-display font-extrabold text-accent-green">20 DT</span>
                          </div>
                          <span className="text-[10px] text-text-secondary italic mb-1">Paiement sur place</span>
                       </div>
                    </div>

                    <Link to={`/reserver/${selectedSlot.terrainId}`} className="block">
                      <Button className="w-full h-14 text-sm font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,135,0.2)]">
                        Réserver ce créneau →
                      </Button>
                    </Link>
                 </div>
               ) : (
                 <div className="py-12 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-background-secondary border border-border-subtle flex items-center justify-center text-text-tertiary">
                       <Calendar size={32} className="animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold uppercase tracking-wider">Sélectionne un créneau</p>
                      <p className="text-xs text-text-secondary">Choisis une heure disponible sur le planning à gauche pour continuer.</p>
                    </div>
                    <Button disabled className="w-full h-14 mt-4 opacity-50 grayscale">
                      Sélectionne un créneau
                    </Button>
                 </div>
               )}
               
               <div className="p-4 bg-background-secondary/50 rounded-xl flex gap-3 border border-border-subtle">
                  <Info size={16} className="text-accent-green shrink-0 mt-0.5" />
                  <p className="text-[10px] text-text-secondary leading-relaxed uppercase font-bold tracking-wider">
                    Annulation gratuite jusqu'à 24h avant le début de la séance.
                  </p>
               </div>
            </Card>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Bar */}
      <div className="md:hidden fixed bottom-20 left-0 right-0 z-50 bg-background-card/95 backdrop-blur-xl border-t border-border-subtle p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="truncate">
            {selectedSlot ? (
              <div>
                <p className="text-xs font-bold uppercase text-accent-green truncate">Terrain {selectedSlot.terrainId.replace('t', '')} · {selectedSlot.time}</p>
                <p className="text-[10px] text-text-secondary truncate">{selectedSlot.date}</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold uppercase">Choisis un créneau</p>
                <p className="text-[10px] text-text-secondary">Sur le planning ci-dessus</p>
              </div>
            )}
          </div>
          <Button 
            onClick={() => selectedSlot && setIsReservationSheetOpen(true)}
            disabled={!selectedSlot}
            className={cn(
              "h-12 px-8 font-bold uppercase text-xs tracking-widest shrink-0 transition-all",
              !selectedSlot && "opacity-50 grayscale"
            )}
          >
            {selectedSlot ? "Réserver" : "Choisir"}
          </Button>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-overlay flex items-center justify-center p-4"
          >
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 text-white hover:text-accent-green p-2 transition-colors z-50"
            >
              <X size={32} />
            </button>
            
            <div className="relative max-w-5xl w-full aspect-video">
              <motion.img 
                key={activePhotoIndex}
                src={COMPLEX_DATA.photos[activePhotoIndex]} 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full h-full object-contain"
              />
              
              <button 
                onClick={() => setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : COMPLEX_DATA.photos.length - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-accent-green hover:text-black transition-all"
              >
                <ChevronLeft size={24} />
              </button>
              
              <button 
                onClick={() => setActivePhotoIndex((prev) => (prev < COMPLEX_DATA.photos.length - 1 ? prev + 1 : 0))}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-accent-green hover:text-black transition-all"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reservation Bottom Sheet (Mobile Only) */}
      <AnimatePresence>
        {isReservationSheetOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReservationSheetOpen(false)}
              className="fixed inset-0 z-[100] bg-black/60 md:hidden"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[110] bg-background-card rounded-t-[32px] p-8 md:hidden border-t border-border-subtle min-h-[50vh]"
            >
               <div className="w-12 h-1.5 bg-border-subtle rounded-full mx-auto mb-8" />
               <h3 className="text-3xl font-display font-extrabold uppercase mb-8">Détails de réservation</h3>
               
               {selectedSlot && (
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-text-secondary text-sm font-bold uppercase tracking-widest">Terrain</span>
                          <span className="font-display font-bold text-xl uppercase">Terrain {selectedSlot.terrainId.replace('t', '')}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-text-secondary text-sm font-bold uppercase tracking-widest">Date</span>
                          <span className="font-bold">{selectedSlot.date}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-text-secondary text-sm font-bold uppercase tracking-widest">Heure</span>
                          <span className="font-bold">{selectedSlot.time} (60 min)</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-text-secondary text-sm font-bold uppercase tracking-widest">Prix</span>
                          <span className="text-3xl font-display font-extrabold text-accent-green">20 DT</span>
                       </div>
                    </div>

                    <div className="p-4 bg-background-secondary rounded-2xl flex gap-3 border border-border-subtle mb-10">
                       <Info size={18} className="text-accent-green shrink-0 mt-0.5" />
                       <p className="text-xs text-text-secondary font-medium">
                         Le paiement se fait sur place au complexe. Merci d'arriver 10 minutes avant votre créneau.
                       </p>
                    </div>

                    <Link to={`/reserver/${selectedSlot.terrainId}`} className="block">
                      <Button className="w-full h-16 rounded-2xl text-lg font-bold uppercase tracking-widest shadow-2xl shadow-accent-green/20">
                        Confirmer la réservation
                      </Button>
                    </Link>
                 </div>
               )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .leaflet-container {
          background-color: #0A0A0F !important;
        }
        .custom-div-icon svg {
          filter: drop-shadow(0 0 5px rgba(0, 255, 135, 0.4));
        }
      `}</style>
    </div>
  );
}
