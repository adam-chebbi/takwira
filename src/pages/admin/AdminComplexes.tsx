import * as React from 'react';
import { collection, query, onSnapshot, doc, updateDoc, getDocs, where, getDoc, orderBy } from 'firebase/firestore';
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
  Activity,
  User,
  Navigation,
  Loader2
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
    const q = query(collection(db, 'complexes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setComplexes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const [expandedData, setExpandedData] = React.useState<Record<string, { manager?: any, terrains: any[] }>>({});
  const [loadingExpanded, setLoadingExpanded] = React.useState<Record<string, boolean>>({});

  const handleExpand = async (complexId: string, managerId: string) => {
    if (expandedRow === complexId) {
      setExpandedRow(null);
      return;
    }

    setExpandedRow(complexId);
    if (!expandedData[complexId]) {
      setLoadingExpanded(prev => ({ ...prev, [complexId]: true }));
      try {
        const [managerDoc, terrainsSnap] = await Promise.all([
          getDoc(doc(db, 'users', managerId)),
          getDocs(query(collection(db, 'terrains'), where('complexId', '==', complexId)))
        ]);

        setExpandedData(prev => ({
          ...prev,
          [complexId]: {
            manager: managerDoc.exists() ? managerDoc.data() : null,
            terrains: terrainsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
          }
        }));
      } catch (err) {
        console.error("Error loading expanded data:", err);
      } finally {
        setLoadingExpanded(prev => ({ ...prev, [complexId]: false }));
      }
    }
  };

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

      <div className="bg-background-card border border-border-subtle rounded-[40px] overflow-hidden shadow-2xl">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-background-secondary/50 border-b border-border-subtle">
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Statut</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Complexe</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Gérant</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary text-center">Terrains</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Date Inscription</th>
                     <th className="px-8 py-6"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border-subtle">
                  {filteredComplexes.map((c) => (
                    <React.Fragment key={c.id}>
                      <tr 
                        onClick={() => handleExpand(c.id, c.managerId)}
                        className={cn(
                          "cursor-pointer transition-all",
                          expandedRow === c.id ? "bg-accent-green/5" : "hover:bg-background-secondary/30"
                        )}
                      >
                         <td className="px-8 py-6">
                            {c.isActive === false ? (
                              <Badge className="bg-red-500/10 text-red-500 border-none">Désactivé</Badge>
                            ) : c.isVerified ? (
                              <Badge className="bg-accent-green/10 text-accent-green border-none">Vérifié</Badge>
                            ) : (
                              <Badge className="bg-amber-500/10 text-amber-500 border-none">En attente</Badge>
                            )}
                         </td>
                         <td className="px-8 py-6">
                            <div className="space-y-1">
                               <p className="text-sm font-bold text-white tracking-tight">{c.name}</p>
                               <p className="text-[10px] text-text-tertiary flex items-center gap-1"><MapPin size={10} className="text-accent-green" /> {c.city}</p>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-background-secondary border border-border-subtle flex items-center justify-center text-text-tertiary">
                                  <User size={14} />
                               </div>
                               <p className="text-xs text-text-secondary font-medium">{c.managerName || 'Gérant'}</p>
                            </div>
                         </td>
                         <td className="px-8 py-6 text-center">
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-border-subtle text-xs font-bold text-text-primary bg-background-secondary">
                               {c.terrainCount || 0}
                            </div>
                         </td>
                         <td className="px-8 py-6 text-[10px] text-text-tertiary font-black uppercase">
                            {c.createdAt ? format((c.createdAt as any).toDate(), 'dd MMM yyyy', { locale: fr }) : '-'}
                          </td>
                          <td className="px-8 py-6 text-right">
                             {expandedRow === c.id ? (
                               <div className="w-8 h-8 rounded-full bg-accent-green text-black flex items-center justify-center mx-auto">
                                 <ChevronUp size={18} />
                               </div>
                             ) : (
                               <div className="w-8 h-8 rounded-full bg-background-secondary text-text-tertiary flex items-center justify-center mx-auto">
                                 <ChevronDown size={18} />
                               </div>
                             )}
                          </td>
                       </tr>
                       {expandedRow === c.id && (
                         <tr className="bg-background-secondary/20">
                            <td colSpan={6} className="px-8 py-10">
                               {loadingExpanded[c.id] ? (
                                 <div className="flex justify-center py-8">
                                   <Loader2 size={24} className="animate-spin text-accent-green" />
                                 </div>
                               ) : (
                                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                   {/* Column 1: Info & Contact */}
                                   <div className="space-y-6">
                                      <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-2xl bg-accent-green/10 text-accent-green flex items-center justify-center">
                                            <Navigation size={20} />
                                         </div>
                                         <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Localisation & Contact</h4>
                                            <p className="text-[12px] text-text-tertiary">{c.address}</p>
                                         </div>
                                      </div>
                                      
                                      <div className="space-y-4 pt-2">
                                         <div className="flex items-center gap-4 group">
                                            <div className="w-8 h-8 rounded-xl bg-background-card border border-border-subtle flex items-center justify-center text-text-tertiary group-hover:text-pl-purple transition-colors"><Phone size={14} /></div>
                                            <p className="text-sm text-text-secondary font-medium">{expandedData[c.id]?.manager?.phone || 'Non renseigné'}</p>
                                         </div>
                                         <div className="flex items-center gap-4 group">
                                            <div className="w-8 h-8 rounded-xl bg-background-card border border-border-subtle flex items-center justify-center text-text-tertiary group-hover:text-pl-purple transition-colors"><Mail size={14} /></div>
                                            <p className="text-sm text-text-secondary font-medium">{expandedData[c.id]?.manager?.email || 'Non renseigné'}</p>
                                         </div>
                                         <div className="flex items-center gap-4 pt-4">
                                            <Button 
                                              variant="outline" 
                                              className="h-10 text-[10px] font-black uppercase tracking-widest border-border-subtle flex-1"
                                              onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${c.lat || 0}&mlon=${c.lng || 0}#map=16/${c.lat || 0}/${c.lng || 0}`, '_blank')}
                                            >
                                              <ExternalLink size={14} className="mr-2" /> Voir sur la carte
                                            </Button>
                                         </div>
                                      </div>
                                   </div>

                                   {/* Column 2: Terrains List */}
                                   <div className="space-y-6">
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary italic flex items-center gap-2">
                                         <Activity size={14} /> Terrains de sport ({expandedData[c.id]?.terrains.length})
                                      </h4>
                                      <div className="space-y-3">
                                         {expandedData[c.id]?.terrains.map((t: any) => (
                                           <div key={t.id} className="flex items-center justify-between p-4 bg-background-card border border-border-subtle rounded-2xl">
                                              <div className="space-y-0.5">
                                                 <p className="text-xs font-bold text-white">{t.name}</p>
                                                 <p className="text-[10px] text-text-tertiary uppercase font-black">{t.type} • {t.pricePerHour} DT/H</p>
                                              </div>
                                              <Badge className={cn(
                                                "border-none",
                                                t.status === 'active' ? "bg-accent-green/10 text-accent-green" : "bg-red-500/10 text-red-500"
                                              )}>
                                                {t.status === 'active' ? 'Actif' : 'Bloqué'}
                                              </Badge>
                                           </div>
                                         ))}
                                         {expandedData[c.id]?.terrains.length === 0 && (
                                           <p className="text-[10px] text-text-tertiary italic text-center py-4 bg-background-card/50 rounded-2xl border border-dashed border-border-subtle">
                                             Aucun terrain configuré
                                           </p>
                                         )}
                                      </div>
                                   </div>

                                   {/* Column 3: Actions */}
                                   <div className="space-y-6">
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary italic">Actions Administration</h4>
                                      <div className="flex flex-col gap-3">
                                         <Button 
                                            variant="secondary" 
                                            fullWidth 
                                            className={cn(
                                              "h-14 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all",
                                              c.isVerified ? "text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white" : "bg-accent-green text-black hover:brightness-110"
                                            )}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleVerify(c.id, c.isVerified);
                                            }}
                                         >
                                            {c.isVerified ? (
                                              <><XCircle size={18} className="mr-2" /> Révoquer Vérification</>
                                            ) : (
                                              <><CheckCircle2 size={18} className="mr-2" /> Valider le Complexe</>
                                            )}
                                         </Button>
                                         <Button 
                                            variant="outline" 
                                            fullWidth 
                                            className={cn(
                                              "h-14 text-[11px] font-black uppercase tracking-widest border-border-subtle rounded-2xl transition-all",
                                              c.isActive === false ? "text-accent-green border-accent-green/30" : "text-text-tertiary hover:text-red-500 hover:border-red-500/30"
                                            )}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleActive(c.id, c.isActive);
                                            }}
                                         >
                                            {c.isActive === false ? "Réactiver l'Accès" : "Désactiver le Complexe"}
                                         </Button>
                                      </div>
                                   </div>
                                 </div>
                               )}
                            </td>
                         </tr>
                       )}
                    </React.Fragment>
                  ))}
               </tbody>
            </table>
         </div>
         {filteredComplexes.length === 0 && !loading && (
           <div className="py-32 flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 rounded-[32px] bg-background-secondary border border-border-subtle flex items-center justify-center text-text-tertiary mb-6">
                 <Search size={32} className="opacity-20" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-white mb-2">Aucun complexe trouvé</h4>
              <p className="text-xs text-text-tertiary max-w-[300px]">
                 Ajuste tes filtres ou ta recherche pour trouver ce que tu cherches.
              </p>
           </div>
         )}
      </div>
    </div>
  );
}
