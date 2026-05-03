import * as React from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  Filter,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Activity
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/src/lib/utils';

export default function AdminComplexes() {
  const [complexes, setComplexes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'verified' | 'pending' | 'inactive'>('all');
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null);

  React.useEffect(() => {
    const q = query(collection(db, 'complexes'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setComplexes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredComplexes = complexes.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'verified' && c.isVerified) ||
                          (statusFilter === 'pending' && !c.isVerified && c.isActive !== false) ||
                          (statusFilter === 'inactive' && c.isActive === false);
    
    return matchesSearch && matchesStatus;
  });

  const toggleVerify = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'complexes', id), { isVerified: !current });
  };

  const toggleActive = async (id: string, current: boolean = true) => {
    await updateDoc(doc(db, 'complexes', id), { isActive: !current });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <h1 className="text-3xl font-display font-black uppercase tracking-tight text-white italic">Complexes & Terrains</h1>
         
         <div className="flex items-center gap-3">
            <div className="relative group flex-1 md:w-64">
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
               <option value="verified">Vérifiés</option>
               <option value="pending">En attente</option>
               <option value="inactive">Inactifs</option>
            </select>
         </div>
      </div>

      <div className="bg-background-card border border-border-subtle rounded-[40px] overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-background-secondary/50 border-b border-border-subtle">
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Statut</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Complexe</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary text-center">Terrains</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Date Inscription</th>
                     <th className="px-8 py-6"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border-subtle">
                  {filteredComplexes.map((c) => (
                    <React.Fragment key={c.id}>
                      <tr 
                        onClick={() => setExpandedRow(expandedRow === c.id ? null : c.id)}
                        className={cn(
                          "cursor-pointer transition-all",
                          expandedRow === c.id ? "bg-blue-500/5" : "hover:bg-background-secondary/30"
                        )}
                      >
                         <td className="px-8 py-6">
                            {c.isActive === false ? (
                              <Badge className="bg-danger/10 text-danger border-none">Désactivé</Badge>
                            ) : c.isVerified ? (
                              <Badge className="bg-accent-green/10 text-accent-green border-none">Vérifié</Badge>
                            ) : (
                              <Badge className="bg-amber-500/10 text-amber-500 border-none">En attente</Badge>
                            )}
                         </td>
                         <td className="px-8 py-6">
                            <div className="space-y-1">
                               <p className="text-sm font-bold text-white">{c.name}</p>
                               <p className="text-[10px] text-text-tertiary flex items-center gap-1"><MapPin size={10} /> {c.city}, {c.address}</p>
                            </div>
                         </td>
                         <td className="px-8 py-6 text-center">
                            <Badge variant="outline" className="text-text-primary px-3">{c.terrainCount || 0}</Badge>
                         </td>
                         <td className="px-8 py-6 text-[10px] text-text-tertiary font-black uppercase">
                            {c.createdAt ? format(c.createdAt.toDate(), 'dd MMM yyyy', { locale: fr }) : '-'}
                         </td>
                         <td className="px-8 py-6 text-right">
                            {expandedRow === c.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                         </td>
                      </tr>
                      {expandedRow === c.id && (
                        <tr className="bg-background-secondary/30">
                           <td colSpan={5} className="px-8 py-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                 <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary italic">Gérant & Contact</h4>
                                    <div className="space-y-3">
                                       <div className="flex items-center gap-3 text-sm text-text-secondary">
                                          <div className="w-8 h-8 rounded-lg bg-background-card border border-border-subtle flex items-center justify-center text-blue-500"><Phone size={14} /></div>
                                          {c.managerPhone || 'N/A'}
                                       </div>
                                       <div className="flex items-center gap-3 text-sm text-text-secondary">
                                          <div className="w-8 h-8 rounded-lg bg-background-card border border-border-subtle flex items-center justify-center text-blue-500"><Mail size={14} /></div>
                                          {c.managerEmail || 'N/A'}
                                       </div>
                                       <div className="flex items-center gap-3 text-sm text-text-secondary">
                                          <div className="w-8 h-8 rounded-lg bg-background-card border border-border-subtle flex items-center justify-center text-blue-500"><MapPin size={14} /></div>
                                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address + ', ' + c.city)}`} target="_blank" className="hover:text-blue-500 underline decoration-blue-500/30">
                                            Voir sur Google Maps
                                          </a>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary italic">Résumé Performance</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                       <div className="p-4 rounded-2xl bg-background-card border border-border-subtle">
                                          <p className="text-xl font-display font-black text-white">0</p>
                                          <p className="text-[8px] font-black uppercase tracking-widest text-text-tertiary">Matchs joués</p>
                                       </div>
                                       <div className="p-4 rounded-2xl bg-background-card border border-border-subtle">
                                          <p className="text-xl font-display font-black text-white">0 DT</p>
                                          <p className="text-[8px] font-black uppercase tracking-widest text-text-tertiary">CA Total</p>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary italic">Actions Administration</h4>
                                    <div className="flex flex-col gap-2">
                                       <Button 
                                          variant="outline" 
                                          fullWidth 
                                          className={cn(
                                            "h-12 text-[10px] font-black uppercase tracking-widest border-border-subtle",
                                            c.isVerified ? "text-danger hover:bg-danger hover:text-white" : "text-accent-green hover:bg-accent-green hover:text-black"
                                          )}
                                          onClick={() => toggleVerify(c.id, c.isVerified)}
                                       >
                                          {c.isVerified ? "Annuler vérification" : "Vérifier le complexe"}
                                       </Button>
                                       <Button 
                                          variant="outline" 
                                          fullWidth 
                                          className={cn(
                                            "h-12 text-[10px] font-black uppercase tracking-widest border-border-subtle",
                                            c.isActive === false ? "text-accent-green" : "text-danger"
                                          )}
                                          onClick={() => toggleActive(c.id, c.isActive)}
                                       >
                                          {c.isActive === false ? "Réactiver le complexe" : "Suspendre le complexe"}
                                       </Button>
                                    </div>
                                 </div>
                              </div>
                           </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
