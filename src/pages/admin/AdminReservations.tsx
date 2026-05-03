import * as React from 'react';
import { collection, query, onSnapshot, orderBy, where, limit } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  ChevronDown, 
  Filter,
  CheckCircle2,
  Clock3,
  XCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/src/lib/utils';

export default function AdminReservations() {
  const [reservations, setReservations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snap) => {
      setReservations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredReservations = reservations.filter(r => {
    const matchesSearch = r.organizerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.terrainName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.complexName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <h1 className="text-3xl font-display font-black uppercase tracking-tight text-white italic">Réservations Globales</h1>
         
         <div className="flex items-center gap-3">
            <div className="relative group w-64">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-blue-500 transition-colors" size={18} />
               <input 
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 bg-background-card border border-border-subtle rounded-2xl pl-12 pr-4 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
               />
            </div>
            <select 
               value={statusFilter}
               onChange={(e: any) => setStatusFilter(e.target.value)}
               className="h-12 bg-background-card border border-border-subtle rounded-2xl px-4 text-[10px] font-black uppercase tracking-widest text-text-tertiary focus:outline-none appearance-none"
            >
               <option value="all">Tous les Statuts</option>
               <option value="confirmed">Confirmées</option>
               <option value="pending">En attente</option>
               <option value="cancelled">Annulées</option>
            </select>
         </div>
      </div>

      <div className="bg-background-card border border-border-subtle rounded-[40px] overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-background-secondary/50 border-b border-border-subtle">
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Statut</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Terrain / Complexe</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Session</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Organisateur</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Date Création</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border-subtle">
                  {filteredReservations.map((r) => (
                    <tr key={r.id} className="hover:bg-background-secondary/30 transition-colors group">
                       <td className="px-8 py-6">
                          {r.status === 'confirmed' ? (
                            <Badge className="bg-accent-green/10 text-accent-green border-none uppercase font-black text-[8px] tracking-widest">Confirmé</Badge>
                          ) : r.status === 'cancelled' ? (
                            <Badge className="bg-danger/10 text-danger border-none uppercase font-black text-[8px] tracking-widest">Annulé</Badge>
                          ) : (
                            <Badge className="bg-amber-500/10 text-amber-500 border-none uppercase font-black text-[8px] tracking-widest">En attente</Badge>
                          )}
                       </td>
                       <td className="px-8 py-6">
                          <div className="space-y-1">
                             <p className="text-sm font-bold text-white leading-none">{r.terrainName}</p>
                             <p className="text-[10px] text-text-tertiary font-black uppercase tracking-widest">{r.complexName}</p>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4 text-xs">
                             <div className="flex items-center gap-1.5 text-text-secondary">
                                <Calendar size={12} className="text-blue-500" /> {r.date}
                             </div>
                             <div className="flex items-center gap-1.5 text-text-secondary">
                                <Clock size={12} className="text-blue-500" /> {r.startTime}
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="space-y-1">
                             <p className="text-xs font-bold text-white leading-none">{r.organizerName}</p>
                             <p className="text-[10px] text-text-tertiary font-mono">{r.organizerPhone || 'N/A'}</p>
                          </div>
                       </td>
                       <td className="px-8 py-6 text-[10px] text-text-tertiary font-black uppercase">
                          {r.createdAt ? format(r.createdAt.toDate(), 'dd/mm/yy HH:mm', { locale: fr }) : '-'}
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
