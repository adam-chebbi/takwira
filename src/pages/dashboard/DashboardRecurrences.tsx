import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  RotateCcw, 
  Shuffle, 
  User, 
  Phone, 
  MapPin,
  Calendar, 
  Clock, 
  Edit2, 
  PauseCircle, 
  Trash2, 
  X, 
  Check,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { cn } from '@/src/lib/utils';

// --- Mock Data ---
interface Recurrence {
  id: string;
  terrain: string;
  organizer: string;
  phone: string;
  day: string;
  start: string;
  end: string;
  startDate: string;
  status: 'active' | 'paused';
}

const RECURRENCES: Recurrence[] = [
  { id: '1', terrain: 'Terrain 1', organizer: 'Ahmed S.', phone: '55 123 456', day: 'Mercredi', start: '19:00', end: '20:00', startDate: '2026-01-08', status: 'active' },
  { id: '2', terrain: 'Terrain 1', organizer: 'Sami K.', phone: '22 987 654', day: 'Vendredi', start: '20:00', end: '21:00', startDate: '2026-02-14', status: 'active' },
  { id: '3', terrain: 'Terrain 2', organizer: 'Sarah M.', phone: '21 000 999', day: 'Lundi', start: '18:00', end: '19:30', startDate: '2026-03-01', status: 'paused' },
];

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function DashboardRecurrences() {
  const [items, setItems] = React.useState(RECURRENCES);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="p-6 md:p-10 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-black uppercase tracking-tight">Réservations Récurrentes</h1>
          <p className="text-text-secondary font-medium uppercase tracking-widest text-[10px]">Gère tes abonnements et créneaux hebdomadaires</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="h-12 px-8 uppercase font-black text-xs tracking-widest gap-2">
           <Plus size={18} /> Créer une récurrence
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
           {items.map((item, i) => (
             <motion.div
               key={item.id}
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: i * 0.1 }}
             >
                <Card className={cn(
                  "p-6 flex flex-col md:flex-row items-center justify-between gap-6 group relative overflow-hidden",
                  item.status === 'paused' && "opacity-60"
                )}>
                   <div className="flex items-center gap-6 flex-1 w-full">
                      <div className="w-14 h-14 rounded-2xl bg-background-secondary border border-border-subtle flex flex-col items-center justify-center">
                         <span className="text-[10px] font-black uppercase tracking-tight text-accent-green">{item.day.slice(0, 3)}</span>
                         <span className="text-[10px] font-bold text-text-tertiary">{item.start}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-1">
                         <div className="flex items-center gap-3">
                            <h4 className="font-display font-black uppercase tracking-tight text-lg truncate">{item.organizer}</h4>
                            <Badge className={cn(
                              "h-5 px-2 text-[8px] font-black uppercase tracking-widest",
                              item.status === 'active' ? "bg-accent-green/10 text-accent-green" : "bg-background-secondary text-text-tertiary"
                            )}>
                              {item.status === 'active' ? 'Active' : 'En pause'}
                            </Badge>
                         </div>
                         <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary uppercase">
                               <MapPin size={12} className="text-accent-green" /> {item.terrain}
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary uppercase">
                               <Phone size={12} className="text-accent-green" /> {item.phone}
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary uppercase">
                               <Calendar size={12} className="text-accent-green" /> Début: {item.startDate}
                            </span>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-3 w-full md:w-auto">
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none h-10 border-border-subtle hover:border-accent-green text-[10px] uppercase font-black tracking-widest gap-2">
                         <Edit2 size={14} /> Modifier
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none h-10 border-danger/30 text-danger hover:bg-danger/10 text-[10px] uppercase font-black tracking-widest gap-2">
                         <Trash2 size={14} /> Arrêter
                      </Button>
                   </div>
                </Card>
             </motion.div>
           ))}
        </AnimatePresence>
      </div>

      {/* Modal Mock */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 z-[200] bg-overlay px-4" />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[210] w-full max-w-xl bg-background-card border border-border-subtle rounded-[32px] p-8 shadow-2xl space-y-8">
               <div className="flex justify-between items-start">
                  <h3 className="text-3xl font-display font-black uppercase tracking-tight">Créer une récurrence</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-text-tertiary hover:text-white"><X size={24} /></button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Jour de la semaine</label>
                        <div className="flex flex-wrap gap-2">
                           {DAYS.map(d => (
                             <button key={d} className="px-3 py-2 rounded-lg bg-background-secondary border border-border-subtle text-[10px] font-black uppercase hover:border-accent-green">{d.slice(0,3)}</button>
                           ))}
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Début</label>
                           <input type="time" className="w-full bg-background-secondary border border-border-subtle rounded-xl px-4 h-12 text-sm text-white" defaultValue="19:00" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Fin</label>
                           <input type="time" className="w-full bg-background-secondary border border-border-subtle rounded-xl px-4 h-12 text-sm text-white" defaultValue="20:00" />
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Organisateur</label>
                        <input type="text" className="w-full bg-background-secondary border border-border-subtle rounded-xl px-4 h-12 text-sm" placeholder="Nom..." />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Téléphone</label>
                        <input type="tel" className="w-full bg-background-secondary border border-border-subtle rounded-xl px-4 h-12 text-sm" placeholder="55 000 000" />
                     </div>
                  </div>
               </div>
               <Button className="w-full h-16 font-black uppercase tracking-widest">Confirmer la récurrence</Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
