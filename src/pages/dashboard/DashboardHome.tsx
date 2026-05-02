import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingUp,
  Phone,
  MessageCircle,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { cn } from '@/src/lib/utils';

// --- Types & Data ---
const CHART_DATA = [
  { h: 8, val: 2 }, { h: 9, val: 3 }, { h: 10, val: 5 }, { h: 11, val: 4 },
  { h: 12, val: 2 }, { h: 13, val: 1 }, { h: 14, val: 3 }, { h: 15, val: 6 },
  { h: 16, val: 8 }, { h: 17, val: 7 }, { h: 18, val: 9 }, { h: 19, val: 10 },
  { h: 20, val: 12 }, { h: 21, val: 11 }, { h: 22, val: 8 }, { h: 23, val: 4 },
];

const PENDING_RESERVATIONS = [
  { id: '1', organizer: 'Hamza B.', terrain: 'Terrain 1', date: 'Ven 22 Mai', time: '19:00 — 20:00', phone: '55667788' },
  { id: '2', organizer: 'Sarah M.', terrain: 'Terrain 2', date: 'Sam 23 Mai', time: '18:00 — 19:30', phone: '22114455' },
  { id: '3', organizer: 'Mehdi K.', terrain: 'Terrain 3', date: 'Dim 24 Mai', time: '21:00 — 22:00', phone: '99887766' },
];

const TERRAINS = ['Terrain 1 (6v6)', 'Terrain 2 (7v7)', 'Terrain 3 (5v5)'];
const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => i + 9); // 09:00 to 23:00

const CURRENT_BLOCKS = [
  { terrainIndex: 0, start: 10, end: 11, label: 'Mehdi K.', status: 'confirmed' },
  { terrainIndex: 0, start: 15, end: 16.5, label: 'Ahmed S.', status: 'confirmed' },
  { terrainIndex: 0, start: 19, end: 20, label: 'Hamza B.', status: 'pending' },
  { terrainIndex: 1, start: 9, end: 11, label: 'Académie (U12)', status: 'recurring' },
  { terrainIndex: 1, start: 18, end: 19, label: 'Omar D.', status: 'confirmed' },
  { terrainIndex: 2, start: 20, end: 21, label: 'Sarah M.', status: 'pending' },
  { terrainIndex: 2, start: 11, end: 12.5, label: 'Adel T.', status: 'confirmed' },
];

// --- Subcomponents ---

function KPICard({ label, value, color, children }: { label: string, value: string | number, color: string, children?: React.ReactNode }) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const targetValue = typeof value === 'number' ? value : parseInt(value);

  React.useEffect(() => {
    let start = 0;
    const end = targetValue;
    const duration = 1000;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayValue(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [targetValue]);

  return (
    <Card className="p-6 border-t-4 border-accent-green bg-background-card overflow-hidden group">
      <div className="absolute inset-0 bg-accent-green/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="space-y-4 relative">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">{label}</p>
        <div className="flex items-end justify-between">
           <h3 className={cn("text-5xl font-display font-black leading-none", color)}>
              {typeof value === 'string' && value.includes('/') ? value : displayValue}
           </h3>
           <div className="w-24 h-12">
              {children}
           </div>
        </div>
      </div>
    </Card>
  );
}

export default function DashboardHome() {
  const [currentTimeX, setCurrentTimeX] = React.useState(0);

  React.useEffect(() => {
    const updateProgress = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      if (hours < 9 || hours > 23) {
        setCurrentTimeX(0);
        return;
      }
      const totalMinutes = (hours - 9) * 60 + minutes;
      const progress = (totalMinutes / (15 * 60)) * 100;
      setCurrentTimeX(progress);
    };
    updateProgress();
    const interval = setInterval(updateProgress, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 md:p-10 space-y-12">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-xl md:text-2xl font-display font-black text-text-tertiary uppercase tracking-tight">VENDREDI 22 MAI 2026</p>
        <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight">Bonjour, Mourad 👋</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard label="Réservations Aujourd'hui" value={14} color="text-accent-green">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA}>
                 <Bar dataKey="val" fill="#22C55E" radius={[2, 2, 0, 0]} />
              </BarChart>
           </ResponsiveContainer>
        </KPICard>
        <KPICard label="Terrains Actifs" value="2 / 3" color="text-white">
           <div className="flex gap-1.5 pt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className={cn("flex-1 h-2 rounded-full", i <= 2 ? "bg-accent-green" : "bg-background-secondary")} />
              ))}
           </div>
        </KPICard>
        <KPICard label="Places Libres Aujourd'hui" value={8} color="text-accent-green" />
        <KPICard label="Membres Académie" value={124} color="text-white">
           <div className="text-accent-green flex items-center justify-end gap-1 font-black text-[10px]">
              <TrendingUp size={14} /> +8%
           </div>
        </KPICard>
      </div>

      {/* Today's Timeline */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
           <h2 className="text-2xl font-display font-black uppercase tracking-tight">Planning d'aujourd'hui</h2>
           <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-text-tertiary">
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-accent-green" /> Confirmé</span>
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-warning" /> Attente</span>
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-500" /> Récurrence</span>
           </div>
        </div>

        <Card className="p-0 overflow-hidden border-border-subtle bg-background-card">
           <div className="relative">
              {/* Time Labels */}
              <div className="flex bg-background-secondary/50 border-b border-border-subtle">
                 <div className="w-32 md:w-48 shrink-0 border-r border-border-subtle p-4" />
                 <div className="flex-1 flex min-w-[800px]">
                    {TIME_SLOTS.map(h => (
                       <div key={h} className="flex-1 text-center py-3 border-r border-border-subtle/30 last:border-0">
                          <span className="text-[10px] font-black font-mono text-text-tertiary">{h}h</span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Rows */}
              <div className="flex flex-col">
                 {TERRAINS.map((terrain, tIdx) => (
                    <div key={terrain} className="flex border-b border-border-subtle last:border-0 group/row">
                       <div className="w-32 md:w-48 shrink-0 border-r border-border-subtle p-6 flex flex-col justify-center gap-1 bg-background-secondary/20">
                          <span className="text-xs font-black uppercase tracking-tight text-white">{terrain}</span>
                          <span className="text-[9px] font-bold text-text-tertiary uppercase">Gazon Synthétique</span>
                       </div>
                       <div className="flex-1 relative min-w-[800px] h-24 bg-background-primary/[0.03]">
                          {/* Grid Lines */}
                          <div className="absolute inset-0 flex pointer-events-none">
                             {TIME_SLOTS.map(h => (
                                <div key={h} className="flex-1 border-r border-border-subtle/10" />
                             ))}
                          </div>

                          {/* Blocks */}
                          {CURRENT_BLOCKS.filter(b => b.terrainIndex === tIdx).map((block, bIdx) => {
                             const left = ((block.start - 9) / 15) * 100;
                             const width = ((block.end - block.start) / 15) * 100;
                             return (
                                <motion.div 
                                  key={bIdx}
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  className={cn(
                                    "absolute top-4 bottom-4 rounded-xl flex flex-col justify-center px-4 cursor-pointer hover:brightness-110 transition-all border border-black/10 origin-left",
                                    block.status === 'confirmed' ? "bg-accent-green text-black shadow-[0_0_20px_rgba(34,197,94,0.2)]" :
                                    block.status === 'pending' ? "bg-warning text-black" :
                                    "bg-blue-500 text-white"
                                  )}
                                  style={{ left: `${left}%`, width: `${width}%` }}
                                >
                                   <span className="text-[10px] font-black uppercase truncate">{block.label}</span>
                                   <span className="text-[8px] font-bold opacity-60">{block.start}h - {block.end}h</span>
                                </motion.div>
                             );
                          })}
                       </div>
                    </div>
                 ))}
              </div>

              {/* Current Time Indicator */}
              {currentTimeX > 0 && (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-danger pointer-events-none z-10"
                  style={{ left: `calc(128px + (100% - 128px) * ${currentTimeX / 100})` }}
                >
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-danger rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                </div>
              )}
           </div>
        </Card>
      </section>

      {/* Pending Reservations Feed */}
      <section className="space-y-8">
         <div className="flex items-center gap-4">
            <h2 className="text-2xl font-display font-black uppercase tracking-tight">Demandes en attente</h2>
            <Badge className="bg-warning text-black font-black h-8 px-3 text-xs">{PENDING_RESERVATIONS.length}</Badge>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
               {PENDING_RESERVATIONS.map((res) => (
                  <motion.div
                    key={res.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                  >
                     <Card className="p-6 border-l-4 border-warning bg-background-card space-y-6 relative group">
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-background-secondary flex items-center justify-center font-display font-black text-xs">
                                    {res.organizer.split(' ')[0][0]}
                                 </div>
                                 <div>
                                    <h4 className="font-bold uppercase tracking-wider text-sm">{res.organizer}</h4>
                                    <p className="text-[10px] text-text-tertiary font-bold">{res.terrain}</p>
                                 </div>
                              </div>
                              <Badge className="bg-warning/10 text-warning border-none font-black text-[8px] tracking-widest uppercase">
                                En attente
                              </Badge>
                           </div>

                           <div className="grid grid-cols-2 gap-4 py-4 border-y border-border-subtle/50">
                              <div className="space-y-1">
                                 <span className="text-[8px] uppercase font-black tracking-widest text-text-tertiary">Date</span>
                                 <div className="flex items-center gap-2 text-xs font-bold uppercase">
                                    <Calendar size={12} className="text-accent-green" /> {res.date}
                                 </div>
                              </div>
                              <div className="space-y-1 text-right">
                                 <span className="text-[8px] uppercase font-black tracking-widest text-text-tertiary">Créneau</span>
                                 <div className="flex items-center gap-2 text-xs font-bold uppercase justify-end">
                                    <Clock size={12} className="text-accent-green" /> {res.time}
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex gap-3">
                           <Button className="flex-1 h-12 bg-accent-green hover:bg-accent-green/90 text-black border-none font-black uppercase text-[10px] tracking-widest">
                              <CheckCircle2 size={16} /> Confirmer
                           </Button>
                           <Button variant="outline" className="flex-1 h-12 border-danger/30 text-danger hover:bg-danger/10 font-black uppercase text-[10px] tracking-widest">
                              <XCircle size={16} /> Refuser
                           </Button>
                        </div>

                        <div className="flex items-center justify-center gap-6 pt-2">
                           <button className="text-text-tertiary hover:text-accent-green flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                              <Phone size={12} /> Appeler
                           </button>
                           <button className="text-text-tertiary hover:text-[#25D366] flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                              <MessageCircle size={12} /> WhatsApp
                           </button>
                        </div>
                     </Card>
                  </motion.div>
               ))}
            </AnimatePresence>
            
            {PENDING_RESERVATIONS.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center gap-4 text-center">
                 <div className="text-6xl opacity-20">✅</div>
                 <div>
                    <h3 className="text-xl font-display font-black uppercase">Toutes les demandes traitées</h3>
                    <p className="text-text-tertiary text-sm">Tu es à jour ! Beau travail Mourad.</p>
                 </div>
              </div>
            )}
         </div>
      </section>

    </div>
  );
}
