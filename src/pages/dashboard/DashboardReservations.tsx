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
import { useAuth } from '@/src/contexts/AuthContext';
import { useManagerComplex } from '@/src/hooks/useManagerComplex';
import { useReservations } from '@/src/hooks/useReservations';
import { db } from '@/src/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function DashboardReservations() {
  const { user } = useAuth();
  const { complex } = useManagerComplex(user?.uid);
  const [filter, setFilter] = React.useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [search, setSearch] = React.useState('');
  
  const { reservations, isLoading } = useReservations({ 
    managerId: user?.uid 
  });

  const filteredReservations = reservations.filter(res => {
    const matchesFilter = filter === 'all' || res.status === filter;
    const matchesSearch = res.organizerName.toLowerCase().includes(search.toLowerCase()) || 
                         res.organizerPhone.includes(search);
    return matchesFilter && matchesSearch;
  });

  const handleUpdateStatus = async (id: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      await updateDoc(doc(db, 'reservations', id), { status: newStatus });
    } catch (error) {
      console.error("Error updating reservation status:", error);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-12 text-white">
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
              className="w-full bg-background-secondary border border-border-subtle rounded-xl pl-12 pr-4 h-12 text-sm focus:border-accent-green outline-none transition-all text-white"
            />
          </div>
          
          <div className="flex bg-background-secondary p-1 rounded-xl border border-border-subtle h-12 w-full lg:w-auto overflow-x-auto no-scrollbar">
            {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 text-[10px] font-black uppercase tracking-widest rounded-lg flex-1 whitespace-nowrap",
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
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Statut</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="p-12"><div className="h-4 bg-background-secondary rounded w-full" /></td>
                      </tr>
                    ))
                  ) : filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-text-tertiary font-bold uppercase tracking-widest text-xs">Aucune réservation trouvée</td>
                    </tr>
                  ) : filteredReservations.map((res) => (
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
                            {res.organizerName.charAt(0)}
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-bold text-sm uppercase tracking-wider">{res.organizerName}</p>
                            <p className="text-[10px] text-text-tertiary font-bold flex items-center gap-1.5 hover:text-accent-green transition-colors cursor-pointer">
                              <Phone size={10} /> {res.organizerPhone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-accent-green" />
                          <span className="text-xs font-bold uppercase tracking-widest">Terrain</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-black uppercase text-white">
                            <Calendar size={14} className="text-accent-green" /> {res.date}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-text-tertiary uppercase">
                            <Clock size={14} /> {res.startTime} - {res.endTime}
                          </div>
                        </div>
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
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {res.status === 'pending' ? (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(res.id, 'confirmed')}
                                title="Confirmer" 
                                className="w-8 h-8 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center hover:bg-accent-green hover:text-black transition-all"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(res.id, 'cancelled')}
                                title="Refuser" 
                                className="w-8 h-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-all"
                              >
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
        </div>
      </section>
    </div>
  );
}
