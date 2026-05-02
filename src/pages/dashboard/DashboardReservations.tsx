import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { cn } from '@/src/lib/utils';

// --- Mock Data ---
interface Reservation {
  id: string;
  organizer: string;
  phone: string;
  terrain: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  price: number;
}

const RESERVATIONS: Reservation[] = [
  { id: '1', organizer: 'Hamza Ben Amor', phone: '55 111 222', terrain: 'Terrain 1', date: '2026-05-22', time: '19:00 - 20:00', status: 'pending', price: 20 },
  { id: '2', organizer: 'Sarah Mansour', phone: '22 333 444', terrain: 'Terrain 2', date: '2026-05-22', time: '18:00 - 19:30', status: 'confirmed', price: 30 },
  { id: '3', organizer: 'Mehdi Kouka', phone: '98 555 666', terrain: 'Terrain 1', date: '2026-05-21', time: '21:00 - 22:00', status: 'confirmed', price: 20 },
  { id: '4', organizer: 'Zied Ayari', phone: '21 777 888', terrain: 'Terrain 3', date: '2026-05-21', time: '20:00 - 21:00', status: 'cancelled', price: 20 },
  { id: '5', organizer: 'Mourad Trabelsi', phone: '50 999 000', terrain: 'Terrain 2', date: '2026-05-20', time: '10:00 - 11:30', status: 'confirmed', price: 30 },
];

export default function DashboardReservations() {
  const [filter, setFilter] = React.useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [search, setSearch] = React.useState('');

  const filteredReservations = RESERVATIONS.filter(res => {
    const matchesFilter = filter === 'all' || res.status === filter;
    const matchesSearch = res.organizer.toLowerCase().includes(search.toLowerCase()) || 
                         res.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 md:p-10 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-black uppercase tracking-tight text-white">Historique des Réservations</h1>
          <p className="text-text-secondary font-medium uppercase tracking-widest text-[10px]">Gère et consulte toutes tes réservations passées et futures</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 border-border-subtle uppercase font-black text-xs tracking-widest gap-2">
            <Download size={18} /> Exporter CSV
          </Button>
          <Button className="h-12 px-8 uppercase font-black text-xs tracking-widest">
            Nouvelle Réservation
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <section className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par nom ou téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background-secondary border border-border-subtle rounded-xl pl-12 pr-4 h-12 text-sm focus:border-accent-green outline-none transition-all"
            />
          </div>
          
          <div className="flex bg-background-secondary p-1 rounded-xl border border-border-subtle h-12 w-full lg:w-auto overflow-x-auto no-scrollbar">
            {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 text-[10px] font-black uppercase tracking-widest rounded-lg flex-1 whitespace-nowrap whitespace-nowrap",
                  filter === f ? "bg-accent-green text-black" : "text-text-tertiary hover:text-white"
                )}
              >
                {f === 'all' ? 'Toutes' : f === 'pending' ? 'En attente' : f === 'confirmed' ? 'Confirmées' : 'Annulées'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-background-card rounded-[24px] border border-border-subtle overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-background-secondary/50 border-b border-border-subtle">
                <tr>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Organisateur</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Terrain</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Date & Heure</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Montant</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Statut</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                <AnimatePresence mode="popLayout">
                  {filteredReservations.map((res) => (
                    <motion.tr 
                      key={res.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-accent-green/[0.02] transition-colors group"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-background-secondary flex items-center justify-center font-display font-black text-xs border border-border-subtle text-accent-green">
                            {res.organizer.split(' ')[0][0]}
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-bold text-sm uppercase tracking-wider">{res.organizer}</p>
                            <p className="text-[10px] text-text-tertiary font-bold flex items-center gap-1.5 hover:text-accent-green transition-colors cursor-pointer">
                              <Phone size={10} /> {res.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-accent-green" />
                          <span className="text-xs font-bold uppercase tracking-widest">{res.terrain}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-black uppercase text-white">
                            <Calendar size={14} className="text-accent-green" /> {res.date}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-text-tertiary uppercase">
                            <Clock size={14} /> {res.time}
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="text-sm font-display font-black">{res.price} DT</span>
                      </td>
                      <td className="p-6">
                        <Badge className={cn(
                          "h-7 px-3 font-black text-[9px] uppercase tracking-widest border-none",
                          res.status === 'confirmed' ? "bg-accent-green/10 text-accent-green" :
                          res.status === 'pending' ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"
                        )}>
                          {res.status === 'confirmed' ? 'Confirmé' : res.status === 'pending' ? 'En attente' : 'Annulé'}
                        </Badge>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          {res.status === 'pending' ? (
                            <>
                              <button title="Confirmer" className="w-8 h-8 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center hover:bg-accent-green hover:text-black transition-all">
                                <CheckCircle2 size={16} />
                              </button>
                              <button title="Refuser" className="w-8 h-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-all">
                                <XCircle size={16} />
                              </button>
                            </>
                          ) : (
                            <button className="p-2 text-text-tertiary hover:text-white transition-colors">
                              <MoreVertical size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 bg-background-secondary/30 border-t border-border-subtle flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
              Affichage de {filteredReservations.length} sur {RESERVATIONS.length} réservations
            </p>
            <div className="flex items-center gap-2">
              <Button disabled variant="outline" size="sm" className="w-10 h-10 p-0 border-border-subtle">
                <ChevronLeft size={18} />
              </Button>
              <div className="flex items-center gap-1">
                <button className="w-10 h-10 rounded-xl bg-accent-green text-black font-black text-xs">1</button>
                <button className="w-10 h-10 rounded-xl hover:bg-background-secondary text-text-tertiary font-black text-xs transition-colors">2</button>
              </div>
              <Button variant="outline" size="sm" className="w-10 h-10 p-0 border-border-subtle">
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Mini Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-background-card border-border-subtle relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 size={64} className="text-accent-green" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-2">Taux d'occupation</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display font-black text-white">84%</span>
            <span className="text-xs font-bold text-accent-green">+5% vs fév</span>
          </div>
          <div className="mt-4 h-1.5 w-full bg-background-secondary rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '84%' }}
              className="h-full bg-accent-green shadow-[0_0_10px_rgba(34,197,94,0.5)]"
            />
          </div>
        </Card>

        <Card className="p-6 bg-background-card border-border-subtle relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertCircle size={64} className="text-warning" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-2">Taux d'annulation</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display font-black text-white">2.4%</span>
            <span className="text-xs font-bold text-danger">-0.8% vs fév</span>
          </div>
          <div className="mt-4 h-1.5 w-full bg-background-secondary rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '2.4%' }}
              className="h-full bg-warning shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
