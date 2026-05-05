import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays, startOfToday, isSameDay, parse, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
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
  User,
  Camera
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { cn } from '@/src/lib/utils';
import { useTerrain } from '@/src/hooks/useTerrain';
import { useReservations } from '@/src/hooks/useReservations';
import { useTerrains } from '@/src/hooks/useTerrains';
import { useToast } from '@/src/components/ui/Toast';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { LazyImage } from '@/src/components/ui/LazyImage';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Review } from '@/src/lib/schema';

// Leaflet map helpers
const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

interface SelectedSlot {
  date: string;
  startTime: string;
  endTime: string;
}

export default function TerrainDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { terrain, complex, isLoading: isTerrainLoading, error: terrainError } = useTerrain(id);
  const { terrains: siblingTerrains } = useTerrains({ complexId: terrain?.complexId });
  const { reservations, isLoading: isReservationsLoading } = useReservations({ terrainId: id });
  
  const [activePhotoIndex, setActivePhotoIndex] = React.useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState<SelectedSlot | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false);
  const [isReservationSheetOpen, setIsReservationSheetOpen] = React.useState(false);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = React.useState(true);
  const [hasMounted, setHasMounted] = React.useState(false);
  const [weekStart, setWeekStart] = React.useState(startOfToday());

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  // Fetch reviews from subcollection
  React.useEffect(() => {
    if (!id) return;
    
    async function fetchReviews() {
      setIsReviewsLoading(true);
      try {
        const reviewsRef = collection(db, 'terrains', id, 'reviews');
        const q = query(reviewsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const reviewList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        setReviews(reviewList);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setIsReviewsLoading(false);
      }
    }

    fetchReviews();
  }, [id]);

  // Handle errors and not found
  React.useEffect(() => {
    if (!isTerrainLoading && !terrain && id) {
      toast("Terrain introuvable.", 'error');
      navigate('/terrains');
    }
  }, [terrain, isTerrainLoading, id, navigate, toast]);

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

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // opening/closing from complex or terrain fallback
  const openingHour = parseInt((complex?.openingTime || '08:00').split(':')[0]);
  const closingHour = parseInt((complex?.closingTime || '23:00').split(':')[0]);
  const hours = Array.from({ length: closingHour - openingHour + 1 }, (_, i) => openingHour + i);

  const handleSlotClick = (date: Date, hour: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

    if (selectedSlot?.date === dateStr && selectedSlot?.startTime === startTime) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot({ date: dateStr, startTime, endTime });
    }
  };

  const getSlotStatus = (date: Date, hour: number): 'available' | 'reserved' | 'recurring' | 'closed' => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const startTimeStr = `${hour.toString().padStart(2, '0')}:00`;

    const res = reservations.find(r => r.date === dateStr && r.startTime === startTimeStr);
    
    if (res) {
      if (res.status === 'cancelled') return 'available';
      if (res.isRecurring) return 'recurring';
      return 'reserved';
    }

    return 'available';
  };

  const handleReservation = () => {
    if (!selectedSlot || !id) return;
    navigate(`/reserver/${id}?date=${selectedSlot.date}&start=${selectedSlot.startTime}&end=${selectedSlot.endTime}`, {
      state: { 
        selectedDate: selectedSlot.date, 
        selectedStartTime: selectedSlot.startTime, 
        selectedEndTime: selectedSlot.endTime 
      }
    });
  };

  if (isTerrainLoading || !terrain) {
    return (
      <div className="min-h-screen pt-24 pb-32 md:pb-12 bg-background-primary overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-[60%] space-y-8">
              <Skeleton className="h-[400px] w-full rounded-2xl" />
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-[300px] w-full rounded-2xl" />
            </div>
            <div className="hidden md:block w-[40%] sticky top-32">
              <Skeleton className="h-[500px] w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const amenitiesMap = {
    'vestiaires': { icon: <ShowerHead size={20} />, label: 'Vestiaires' },
    'eclairage': { icon: <Lightbulb size={20} />, label: 'Éclairage' },
    'parking': { icon: <Car size={20} />, label: 'Parking' },
    'buvette': { icon: <Coffee size={20} />, label: 'Buvette' },
    'tribune': { icon: <Users size={20} />, label: 'Tribune' },
  };

  return (
    <div className="min-h-screen pt-24 pb-32 md:pb-12 bg-background-primary overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8 relative items-start">
          
          {/* Left Column (60%) */}
          <div className="w-full md:w-[60%] space-y-12">
            
            {/* Photo Gallery */}
            <section className="space-y-4">
              <div className="relative h-[220px] md:h-[400px] w-full rounded-2xl overflow-hidden group shadow-2xl border border-border-subtle bg-background-secondary/20">
                {terrain.photos && terrain.photos.length > 0 ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activePhotoIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full"
                    >
                      <LazyImage 
                        src={terrain.photos[activePhotoIndex]} 
                        alt={terrain.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-background-secondary to-background-card flex flex-col items-center justify-center gap-4">
                    <Camera size={48} className="text-text-tertiary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-text-tertiary">Pas de photos disponibles</span>
                  </div>
                )}
                
                {terrain.photos && terrain.photos.length > 0 && (
                  <button 
                    onClick={() => setIsLightboxOpen(true)}
                    className="absolute top-4 right-4 bg-background-primary/60 backdrop-blur-md p-2 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Maximize2 size={20} />
                  </button>
                )}
              </div>

              {terrain.photos && terrain.photos.length > 1 && (
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {terrain.photos.map((photo, index) => (
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
              )}
            </section>

            {/* Complex/Terrain Header */}
            <section>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl font-display uppercase font-extrabold tracking-tighter leading-none">
                    {terrain.name}
                  </h1>
                  <h2 className="text-lg md:text-xl font-bold text-text-secondary uppercase">
                    {complex?.name || terrain.complexName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-text-secondary">
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span className="text-sm font-medium">{complex?.city}, {complex?.neighborhood || ''}</span>
                    </div>
                    {complex?.isVerified && (
                      <div className="flex items-center gap-1.5 bg-accent-green/10 text-accent-green px-2 py-0.5 rounded-full border border-accent-green/20">
                        <Check size={12} strokeWidth={3} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Vérifié</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5 text-warning">
                        <Star size={14} className="fill-current" />
                        <span className="text-sm font-bold text-text-primary ml-1">{complex?.rating || 4.5}</span>
                      </div>
                      <span className="text-xs">({complex?.reviewsCount || 0} avis)</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="flex gap-2 h-11 px-6 font-bold"
                  onClick={() => complex && window.open(`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%3B${complex.lat}%2C${complex.lng}`, '_blank')}
                >
                  <MapIcon size={18} /> Itinéraire
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Badge variant="primary" className="py-1 px-4 text-xs font-bold uppercase tracking-wide">
                  {terrain.type}
                </Badge>
                <div className="flex items-center gap-2 bg-background-secondary px-4 py-1.5 rounded-full border border-border-subtle text-xs font-medium">
                  <Clock size={14} className="text-accent-green" />
                  {complex?.openingTime || '08:00'} - {complex?.closingTime || '00:00'}
                </div>
              </div>
            </section>

            {/* Terrain Selector Tabs */}
            {siblingTerrains && siblingTerrains.length > 1 && (
              <section className="border-b border-border-subtle">
                <div className="flex gap-8 overflow-x-auto no-scrollbar">
                  {siblingTerrains.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => navigate(`/terrains/${s.id}`)}
                      className={cn(
                        "pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
                        id === s.id 
                          ? "text-accent-green" 
                          : "text-text-secondary hover:text-text-primary"
                      )}
                    >
                      {s.name} · {s.type}
                      {id === s.id && (
                        <motion.div 
                          layoutId="activeTab" 
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-green" 
                        />
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Availability Schedule */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display uppercase font-bold tracking-tight">Disponibilités</h2>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setWeekStart(prev => addDays(prev, -7))}
                  >
                    <ChevronLeft size={18} />
                  </Button>
                  <span className="text-xs font-bold uppercase px-2 font-sans">
                    {format(weekStart, 'dd MMM', { locale: fr })} - {format(addDays(weekStart, 6), 'dd MMM', { locale: fr })}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setWeekStart(prev => addDays(prev, 7))}
                  >
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </div>

              <div className="bg-background-secondary rounded-2xl border border-border-subtle overflow-hidden">
                <div className="grid grid-cols-7 border-b border-border-subtle bg-background-card/50">
                  {days.map((date, i) => (
                    <div key={i} className="py-4 text-center border-r border-border-subtle last:border-r-0">
                      <span className="block text-[10px] uppercase font-bold text-text-secondary mb-1">
                        {format(date, 'eee', { locale: fr })}
                      </span>
                      <span className="block text-lg font-display font-bold">
                        {format(date, 'd')}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="h-[400px] overflow-y-auto no-scrollbar relative font-sans">
                  <div className="grid grid-cols-7 h-full">
                    {days.map((date, dayIdx) => (
                      <div key={dayIdx} className="border-r border-border-subtle last:border-r-0 flex flex-col">
                        {hours.map((hour) => {
                          const status = getSlotStatus(date, hour);
                          const dateStr = format(date, 'yyyy-MM-dd');
                          const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                          const isSelected = selectedSlot?.date === dateStr && selectedSlot?.startTime === timeStr;
                          
                          return (
                            <button
                              key={hour}
                              onClick={() => status === 'available' && handleSlotClick(date, hour)}
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
                      {format(parse(selectedSlot.date, 'yyyy-MM-dd', new Date()), 'eeee d MMMM', { locale: fr })} · {selectedSlot.startTime} - {selectedSlot.endTime} · {terrain.name}
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
                  {terrain.description || complex?.description || "Aucune description fournie pour ce terrain."}
                </motion.p>
                {!isDescriptionExpanded && (terrain.description || complex?.description) && (
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background-primary to-transparent" />
                )}
              </div>
              {(terrain.description || complex?.description) && (
                <button 
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-accent-green font-bold text-sm uppercase tracking-widest hover:gap-2 flex items-center transition-all"
                >
                  {isDescriptionExpanded ? "Lire moins" : "Lire plus"} <ChevronDown size={14} className={cn("ml-1 transition-transform", isDescriptionExpanded && "rotate-180")} />
                </button>
              )}
            </section>

            {/* Amenities */}
            {terrain.amenities && terrain.amenities.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-2xl font-display uppercase font-bold tracking-tight">Équipements</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {terrain.amenities.map((slug) => {
                    const item = amenitiesMap[slug as keyof typeof amenitiesMap];
                    if (!item) return null;
                    return (
                      <div key={slug} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-accent-green/10 border-accent-green/20 text-accent-green">
                          {item.icon}
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wider text-text-primary">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Localisation */}
            {complex && (
              <section className="space-y-6">
                <h2 className="text-2xl font-display uppercase font-bold tracking-tight">Localisation</h2>
                <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-border-subtle shadow-inner z-0">
                  {hasMounted && (
                    <MapContainer 
                      center={[complex.lat, complex.lng]} 
                      zoom={15} 
                      className="h-full w-full"
                      zoomControl={false}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        url="https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                        attribution='&copy; CARTO'
                      />
                      <Marker position={[complex.lat, complex.lng]} icon={customIcon} />
                      <ChangeView center={[complex.lat, complex.lng]} zoom={15} />
                    </MapContainer>
                  )}
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-accent-green shrink-0 mt-1" size={20} />
                    <p className="text-text-secondary font-sans leading-tight">
                      {complex.address}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2 h-10"
                    onClick={() => complex && window.open(`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%3B${complex.lat}%2C${complex.lng}`, '_blank')}
                  >
                     <ExternalLink size={16} /> Google Maps
                  </Button>
                </div>
              </section>
            )}

            {/* Reviews Section */}
            <section className="space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display uppercase font-bold tracking-tight">Avis des joueurs</h2>
                <Button className="bg-accent-green/10 text-accent-green border border-accent-green/20 hover:bg-accent-green hover:text-black">
                  Laisser un avis
                </Button>
              </div>

              {isReviewsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6 divide-y divide-border-subtle">
                  {reviews.map((review) => (
                    <div key={review.id} className="pt-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-background-card flex items-center justify-center text-accent-green font-bold text-sm border border-border-subtle">
                            {review.userName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm uppercase tracking-wider">{review.userName}</h4>
                            <p className="text-[10px] text-text-secondary">
                              {review.createdAt?.toDate ? format(review.createdAt.toDate(), 'dd MMM yyyy', { locale: fr }) : 'Récemment'}
                            </p>
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
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-border-subtle rounded-3xl">
                  <Star size={32} className="mx-auto text-text-tertiary mb-3 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest text-text-tertiary">
                    Sois le premier à laisser un avis !
                  </p>
                </div>
              )}
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
                        <span className="text-[10px] uppercase font-bold text-accent-green tracking-widest">Terrain sélectionné</span>
                        <button onClick={() => setSelectedSlot(null)} className="text-text-secondary hover:text-danger">
                          <X size={14} />
                        </button>
                      </div>
                      <p className="text-lg font-display font-bold uppercase mb-1">{terrain.name} · {terrain.type}</p>
                      <p className="text-sm font-medium text-text-secondary">
                        {format(parse(selectedSlot.date, 'yyyy-MM-dd', new Date()), 'eeee d MMMM', { locale: fr })} @ {selectedSlot.startTime}
                      </p>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-text-secondary">Format</span>
                          <span className="font-bold uppercase tracking-wider">{terrain.type}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-text-secondary">Durée</span>
                          <span className="font-bold uppercase tracking-wider">60 Minutes</span>
                       </div>
                       <div className="pt-4 border-t border-border-subtle flex justify-between items-end">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-text-secondary block mb-1">Prix total</span>
                            <span className="text-3xl font-display font-extrabold text-accent-green">{terrain.pricePerHour} DT</span>
                          </div>
                          <span className="text-[10px] text-text-secondary italic mb-1">Paiement sur place</span>
                       </div>
                    </div>

                    <Button 
                      onClick={handleReservation}
                      className="w-full h-14 text-sm font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,135,0.2)]"
                    >
                      Réserver ce créneau →
                    </Button>
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
                <p className="text-xs font-bold uppercase text-accent-green truncate">{terrain.name} · {selectedSlot.startTime}</p>
                <p className="text-[10px] text-text-secondary truncate">{format(parse(selectedSlot.date, 'yyyy-MM-dd', new Date()), 'dd MMM yyyy', { locale: fr })}</p>
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
        {isLightboxOpen && terrain.photos && (
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
                src={terrain.photos[activePhotoIndex]} 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full h-full object-contain"
              />
              
              <button 
                onClick={() => setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : terrain.photos.length - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white hover:bg-accent-green hover:text-black transition-all"
              >
                <ChevronLeft size={24} />
              </button>
              
              <button 
                onClick={() => setActivePhotoIndex((prev) => (prev < terrain.photos.length - 1 ? prev + 1 : 0))}
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
                          <span className="font-display font-bold text-xl uppercase">{terrain.name}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-text-secondary text-sm font-bold uppercase tracking-widest">Date</span>
                          <span className="font-bold">{format(parse(selectedSlot.date, 'yyyy-MM-dd', new Date()), 'dd MMMM yyyy', { locale: fr })}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-text-secondary text-sm font-bold uppercase tracking-widest">Heure</span>
                          <span className="font-bold">{selectedSlot.startTime} (60 min)</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-text-secondary text-sm font-bold uppercase tracking-widest">Prix</span>
                          <span className="text-3xl font-display font-extrabold text-accent-green">{terrain.pricePerHour} DT</span>
                       </div>
                    </div>

                    <div className="p-4 bg-background-secondary rounded-2xl flex gap-3 border border-border-subtle mb-10">
                       <Info size={18} className="text-accent-green shrink-0 mt-0.5" />
                       <p className="text-xs text-text-secondary font-medium outline-none">
                         Le paiement se fait sur place au complexe. Merci d'arriver 10 minutes avant votre créneau.
                       </p>
                    </div>

                    <Button 
                      onClick={handleReservation}
                      className="w-full h-16 rounded-2xl text-lg font-bold uppercase tracking-widest shadow-2xl shadow-accent-green/20"
                    >
                      Confirmer la réservation
                    </Button>
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
