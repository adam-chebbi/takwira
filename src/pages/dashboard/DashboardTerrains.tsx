import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Phone, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  MoreVertical,
  X,
  User,
  Activity
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { cn } from '@/src/lib/utils';

// --- Mock Data ---
const TERRAINS = [
  { id: '1', name: 'Terrain 1', format: '6 vs 6', type: 'Synthétique' },
  { id: '2', name: 'Terrain 2', format: '7 vs 7', type: 'Synthétique' },
  { id: '3', name: 'Terrain 3', format: '5 vs 5', type: 'Synthétique' },
];

const DAYS = ['Lundi 18', 'Mardi 19', 'Mercredi 20', 'Jeudi 21', 'Vendredi 22', 'Samedi 23', 'Dimanche 24'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 9); // 09:00 to 23:00

interface Reservation {
  id: string;
  day: number; // 0-6
  start: number;
  end: number;
  organizer: string;
  phone: string;
  status: 'confirmed' | 'pending' | 'blocked';
  type?: 'public' | 'manual' | 'recurring';
}

const INITIAL_RESERVATIONS: Reservation[] = [
  { id: 'r1', day: 4, start: 19, end: 20, organizer: 'Hamza B.', phone: '55 123 456', status: 'confirmed', type: 'public' },
  { id: 'r2', day: 4, start: 10, end: 11.5, organizer: 'Sami K.', phone: '22 987 654', status: 'confirmed', type: 'manual' },
  { id: 'r3', day: 5, start: 18, end: 19, organizer: 'Yassine M.', phone: '98 444 333', status: 'pending' },
  { id: 'r4', day: 1, start: 9, end: 11, organizer: 'Académie U12', phone: 'Organisateur Club', status: 'confirmed', type: 'recurring' },
  { id: 'r5', day: 2, start: 14, end: 15, organizer: 'Mourad (Gérant)', phone: '-', status: 'blocked' },
];

export default function DashboardTerrains() {
  const [selectedTerrain, setSelectedTerrain] = React.useState(TERRAINS[0]);
  const [reservations, setReservations] = React.useState(INITIAL_RESERVATIONS);
  const [selectedSlot, setSelectedSlot] = React.useState<{ day: number, hour: number } | null>(null);
  const [isManualBookingOpen, setIsManualBookingOpen] = React.useState(false);
  
  const [formName, setFormName] = React.useState('');
  const [formPhone, setFormPhone] = React.useState('');

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    
    const newRes: Reservation = {
      id: Math.random().toString(36).substr(2, 9),
      day: selectedSlot.day,
      start: selectedSlot.hour,
      end: selectedSlot.hour + 1,
      organizer: formName,
      phone: formPhone,
      status: 'confirmed',
      type: 'manual'
    };
    
    setReservations(prev => [...prev, newRes]);
    setSelectedSlot(null);
    setFormName('');
    setFormPhone('');
  };

  return (
    <div className="p-6 md:p-10 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-black uppercase tracking-tight">Gestion des Terrains</h1>
          <p className="text-text-secondary font-medium uppercase tracking-widest text-[10px]">Garde une vue d'ensemble sur tes créneaux</p>
        </div>
        <Button className="h-12 px-8 uppercase font-black text-xs tracking-widest gap-2">
           <Plus size={18} /> Ajouter un terrain
        </Button>
      </div>

      <div className="flex flex-nowrap overflow-x-auto gap-4 pb-2 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
         {TERRAINS.map((terrain) => (
           <button 
             key={terrain.id}
             onClick={() => setSelectedTerrain(terrain)}
             className={cn(
               "shrink-0 px-6 py-4 rounded-2xl border transition-all flex flex-col gap-1 items-start min-w-[180px]",
               selectedTerrain.id === terrain.id 
                ? "bg-accent-green border-accent-green text-black shadow-xl shadow-accent-green/20" 
                : "bg-background-card border-border-subtle text-text-tertiary hover:border-accent-green/30"
             )}
           >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{terrain.format}</span>
              <span className="text-lg font-display font-black uppercase tracking-tight">{terrain.name}</span>
           </button>
         ))}
      </div>

      <Card className="p-0 overflow-hidden border-border-subtle bg-background-card">
         <div className="bg-background-secondary/50 border-b border-border-subtle p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="flex items-center bg-background-primary p-1 rounded-xl border border-border-subtle">
                  <button className="p-2 text-text-tertiary hover:text-white"><ChevronLeft size={18} /></button>
                  <div className="px-4 text-[10px] font-black uppercase tracking-widest">Cette Semaine</div>
                  <button className="p-2 text-text-tertiary hover:text-white"><ChevronRight size={18} /></button>
               </div>
               <span className="text-xs font-bold uppercase tracking-widest text-text-tertiary">Mai 2026</span>
            </div>
         </div>

         <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
               <div className="flex border-b border-border-subtle font-display font-black uppercase text-[10px] tracking-widest">
                  <div className="w-20 shrink-0 p-4 border-r border-border-subtle" />
                  {DAYS.map((day, i) => (
                    <div key={i} className="flex-1 p-4 text-center border-r border-border-subtle/50 last:border-0 bg-background-secondary/20">
                       <span className={cn(i === 4 ? "text-accent-green" : "text-text-secondary")}>{day}</span>
                    </div>
                  ))}
               </div>

               <div className="flex flex-col">
                  {HOURS.map((hour) => (
                    <div key={hour} className="flex border-b border-border-subtle last:border-0 h-16 md:h-20">
                       <div className="w-20 shrink-0 p-4 border-r border-border-subtle flex items-center justify-center font-mono text-[10px] font-black text-text-tertiary">
                          {hour}h00
                       </div>
                       {DAYS.map((_, dayIdx) => {
                         const reservation = reservations.find(r => r.day === dayIdx && Math.floor(r.start) === hour);
                         return (
                           <div 
                             key={dayIdx} 
                             onClick={() => !reservation && setSelectedSlot({ day: dayIdx, hour })}
                             className={cn(
                               "flex-1 p-2 border-r border-border-subtle/30 last:border-0 relative transition-colors group",
                               !reservation && "hover:bg-accent-green/[0.03] cursor-pointer"
                             )}
                           >
                              {reservation ? (
                                <motion.div 
                                  initial={{ scale: 0.95, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className={cn(
                                    "absolute inset-1.5 rounded-lg p-2 md:p-3 overflow-hidden shadow-sm flex flex-col justify-between z-10",
                                    reservation.status === 'confirmed' ? "bg-accent-green text-black" :
                                    reservation.status === 'pending' ? "bg-warning text-black" :
                                    "bg-background-secondary border border-border-subtle text-text-tertiary"
                                  )}
                                >
                                   <div className="flex items-start justify-between">
                                      <span className="text-[10px] font-black uppercase tracking-tight leading-[1.1] truncate pr-1">
                                         {reservation.organizer}
                                      </span>
                                   </div>
                                </motion.div>
                              ) : (
                                <div className="absolute inset-0 items-center justify-center hidden group-hover:flex">
                                   <Plus size={16} className="text-accent-green/50" />
                                </div>
                              )}
                           </div>
                         );
                       })}
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </Card>

      <AnimatePresence>
        {selectedSlot && (
           <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedSlot(null)}
                className="fixed inset-0 z-[200] bg-overlay px-4"
              />
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[210] w-full max-w-md bg-background-card border border-border-subtle rounded-[32px] p-8 shadow-2xl space-y-8"
              >
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <h3 className="text-3xl font-display font-black uppercase tracking-tight leading-none">Réserver un <br /> créneau</h3>
                       <Badge className="bg-accent-green/10 text-accent-green border-accent-green/20 font-black h-8 px-4 text-xs">
                          {DAYS[selectedSlot.day]} · {selectedSlot.hour}h00
                       </Badge>
                    </div>
                    <button onClick={() => setSelectedSlot(null)} className="text-text-tertiary hover:text-white">
                       <X size={24} />
                    </button>
                 </div>

                 <form onSubmit={handleBooking} className="space-y-6">
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Nom de l'organisateur</label>
                          <input 
                            required
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="w-full bg-background-secondary border border-border-subtle focus:border-accent-green focus:outline-none rounded-xl px-4 h-14 font-sans text-sm transition-all"
                            placeholder="Ex: Hatem Trabelsi"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Numéro de téléphone</label>
                          <input 
                            required
                            type="tel"
                            value={formPhone}
                            onChange={(e) => setFormPhone(e.target.value)}
                            className="w-full bg-background-secondary border border-border-subtle focus:border-accent-green focus:outline-none rounded-xl px-4 h-14 font-sans text-sm transition-all"
                            placeholder="+216 00 000 000"
                          />
                       </div>
                    </div>
                    <Button type="submit" className="w-full h-16 font-black uppercase tracking-widest shadow-2xl shadow-accent-green/20">
                       Créer la réservation
                    </Button>
                 </form>
              </motion.div>
           </>
        )}
      </AnimatePresence>
    </div>
  );
}
