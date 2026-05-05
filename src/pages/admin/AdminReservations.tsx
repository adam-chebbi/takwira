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
  FileText,
  LayoutDashboard
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
    const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'), limit(200));
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

  const statusPills = [
    { id: 'all', label: 'Tous', icon: Filter },
    { id: 'confirmed', label: 'Confirmés', icon: CheckCircle2 },
    { id: 'pending', label: 'En attente', icon: Clock3 },
    { id: 'cancelled', label: 'Annulés', icon: XCircle }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
         <h1 className="text-3xl font-display font-black uppercase tracking-tight text-white italic">Réservations Globales</h1>
         
         <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center p-1 bg-background-card border border-border-subtle rounded-2xl overflow-x-auto max-w-full">
               {statusPills.map((pill) => (
                 <button
                   key={pill.id}
                   onClick={() => setStatusFilter(pill.id as any)}
                   className={cn(
                     "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                     statusFilter === pill.id ? "bg-accent-green text-black" : "text-text-tertiary hover:text-white"
                   )}
                 >
                   <pill.icon size={14} />
                   {pill.label}
                 </button>
               ))}
            </div>

            <div className="relative group w-full md:w-64">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-blue-500 transition-colors" size={18} />
               <input 
                  type="text"
                  placeholder="Rechercher par organisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 bg-background-card border border-border-subtle rounded-2xl pl-12 pr-4 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
               />
            </div>
         </div>
      </div>

      <div className="bg-background-card border border-border-subtle rounded-[40px] overflow-hidden shadow-2xl">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-background-secondary/50 border-b border-border-subtle">
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Statut</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Terrain / Complexe</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Organisateur</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Contact</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Date & Heure</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Créé le</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border-subtle">
                  {filteredReservations.map((r) => (
                    <tr key={r.id} className="hover:bg-background-secondary/30 transition-colors group">
                       <td className="px-8 py-6">
                          {r.status === 'confirmed' ? (
                            <Badge className="bg-accent-green/10 text-accent-green border-none uppercase font-black text-[8px] tracking-[0.2em] px-3 py-1">Confirmé</Badge>
                          ) : r.status === 'cancelled' ? (
                            <Badge className="bg-red-500/10 text-red-500 border-none uppercase font-black text-[8px] tracking-[0.2em] px-3 py-1">Annulé</Badge>
                          ) : (
                            <Badge className="bg-amber-500/10 text-amber-500 border-none uppercase font-black text-[8px] tracking-[0.2em] px-3 py-1">En attente</Badge>
                          )}
                       </td>
                       <td className="px-8 py-6">
                          <div className="space-y-1">
                             <p className="text-sm font-bold text-white leading-none tracking-tight">{r.terrainName}</p>
                             <p className="text-[10px] text-text-tertiary font-black uppercase tracking-widest flex items-center gap-1.5"><MapPin size={10} className="text-accent-green" /> {r.complexName}</p>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-background-secondary flex items-center justify-center text-text-tertiary">
                                <User size={14} />
                             </div>
                             <p className="text-xs text-text-secondary font-bold">{r.organizerName}</p>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-text-tertiary">
                             <Phone size={12} className="text-blue-500" />
                             <span className="font-mono text-[11px] font-bold text-text-secondary">{r.organizerPhone || 'N/A'}</span>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                             <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-tighter text-white">
                                <Calendar size={14} className="text-pl-purple" /> {r.date ? format(new Date(r.date), 'dd MMM yyyy', { locale: fr }) : '-'}
                             </div>
                             <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-tighter text-white">
                                <Clock size={14} className="text-pl-purple" /> {r.startTime}
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6 text-[10px] text-text-tertiary font-black uppercase">
                          {r.createdAt ? format((r.createdAt as any).toDate(), 'dd/MM/yy HH:mm', { locale: fr }) : '-'}
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
         {filteredReservations.length === 0 && !loading && (
           <div className="py-32 flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 rounded-[32px] bg-background-secondary border border-border-subtle flex items-center justify-center text-text-tertiary mb-6">
                 <LayoutDashboard size={32} className="opacity-20" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-white mb-2">Aucune réservation trouvée</h4>
              <p className="text-xs text-text-tertiary max-w-[300px]">
                 Les réservations apparaîtront ici dès qu'elles seront effectuées.
              </p>
           </div>
         )}
      </div>
    </div>
  );
}
