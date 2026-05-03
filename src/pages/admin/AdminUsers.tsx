import * as React from 'react';
import { collection, query, onSnapshot, doc, updateDoc, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/src/lib/firebase';
import { 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Shield, 
  MoreVertical,
  ChevronRight,
  Filter,
  Calendar,
  Lock,
  Unlock
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/src/lib/utils';

export default function AdminUsers() {
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<'all' | 'user' | 'manager' | 'admin'>('all');
  const [selectedUser, setSelectedUser] = React.useState<any | null>(null);

  React.useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.phoneNumber?.includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const changeRole = async (userId: string, newRole: string) => {
    await updateDoc(doc(db, 'users', userId), { role: newRole });
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, role: newRole });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean = true) => {
    await updateDoc(doc(db, 'users', userId), { isActive: !currentStatus });
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, isActive: !currentStatus });
    }
  };

  const maskPhone = (phone?: string) => {
    if (!phone) return 'N/A';
    if (phone.length < 4) return phone;
    return phone.substring(0, 4) + ' •• ••• ••';
  };

  return (
    <div className="flex gap-8 h-[calc(100vh-160px)]">
      {/* Left List */}
      <div className="flex-1 flex flex-col gap-6">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-display font-black uppercase tracking-tight text-white italic">Utilisateurs</h1>
            
            <div className="flex items-center gap-3">
               <div className="relative group w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                     type="text"
                     placeholder="Rechercher par nom..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full h-12 bg-background-card border border-border-subtle rounded-2xl pl-12 pr-4 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                  />
               </div>
               <select 
                  value={roleFilter}
                  onChange={(e: any) => setRoleFilter(e.target.value)}
                  className="h-12 bg-background-card border border-border-subtle rounded-2xl px-4 text-[10px] font-black uppercase tracking-widest text-text-tertiary focus:outline-none appearance-none"
               >
                  <option value="all">Tous les Rôles</option>
                  <option value="user">Joueurs</option>
                  <option value="manager">Gérants</option>
                  <option value="admin">Administrateurs</option>
               </select>
            </div>
         </div>

         <div className="flex-1 bg-background-card border border-border-subtle rounded-[40px] overflow-hidden flex flex-col">
            <div className="overflow-auto flex-1">
               <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10">
                     <tr className="bg-background-secondary border-b border-border-subtle">
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Utilisateur</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Téléphone</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary text-center">Rôle</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Ville</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Inscription</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                     {filteredUsers.map((u) => (
                       <tr 
                         key={u.id}
                         onClick={() => setSelectedUser(u)}
                         className={cn(
                           "cursor-pointer transition-all",
                           selectedUser?.id === u.id ? "bg-blue-500/5" : "hover:bg-background-secondary/30",
                           u.isActive === false && "opacity-50"
                         )}
                       >
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center text-text-tertiary font-black uppercase overflow-hidden">
                                   {u.photoURL ? <img src={u.photoURL} alt="" /> : u.displayName?.substring(0, 2) || '??'}
                                </div>
                                <div className="space-y-1">
                                   <p className="text-sm font-bold text-white leading-none">{u.displayName || 'Utilisateur Anonyme'}</p>
                                   <p className="text-[10px] text-text-tertiary leading-none">{u.email || 'Pas d\'email'}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6 font-mono text-[10px] text-text-secondary">
                             {maskPhone(u.phoneNumber)}
                          </td>
                          <td className="px-8 py-6 text-center">
                             <Badge 
                                variant="outline" 
                                className={cn(
                                  "uppercase font-black text-[8px] tracking-widest px-2",
                                  u.role === 'admin' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                  u.role === 'manager' ? "bg-accent-green/10 text-accent-green border-accent-green/20" :
                                  "bg-background-secondary text-text-tertiary border-border-subtle"
                                )}
                             >
                                {u.role || 'user'}
                             </Badge>
                          </td>
                          <td className="px-8 py-6 text-[10px] text-text-secondary uppercase font-black">
                             {u.city || '-'}
                          </td>
                          <td className="px-8 py-6 text-[10px] text-text-tertiary font-black uppercase">
                             {u.createdAt ? format(u.createdAt.toDate(), 'dd/mm/yy', { locale: fr }) : '-'}
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      {/* Right Detail Panel */}
      <AnimatePresence mode="wait">
        {selectedUser ? (
          <motion.aside 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="w-[380px] bg-background-card border border-border-subtle rounded-[40px] p-8 flex flex-col gap-8 shadow-2xl relative"
          >
             <button 
               onClick={() => setSelectedUser(null)}
               className="absolute top-6 right-6 w-8 h-8 rounded-full bg-background-secondary flex items-center justify-center text-text-tertiary hover:text-white"
             >
                <ChevronRight size={18} />
             </button>

             <div className="flex flex-col items-center text-center gap-4">
                <div className="w-24 h-24 rounded-[32px] bg-background-secondary flex items-center justify-center text-white text-3xl font-black uppercase border border-border-subtle">
                   {selectedUser.photoURL ? <img src={selectedUser.photoURL} alt="" className="w-full h-full object-cover" /> : selectedUser.displayName?.substring(0, 1)}
                </div>
                <div className="space-y-1">
                   <h2 className="text-2xl font-display font-black uppercase tracking-tight text-white">{selectedUser.displayName}</h2>
                   <p className="text-xs text-blue-500 font-black uppercase tracking-widest">{selectedUser.role || 'user'}</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-background-secondary/30 border border-border-subtle">
                   <p className="text-xl font-display font-black text-white">0</p>
                   <p className="text-[8px] font-black uppercase tracking-widest text-text-tertiary">Matchs</p>
                </div>
                <div className="p-4 rounded-2xl bg-background-secondary/30 border border-border-subtle">
                   <p className="text-xl font-display font-black text-white">0</p>
                   <p className="text-[8px] font-black uppercase tracking-widest text-text-tertiary">Réservations</p>
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary italic">Informations</h4>
                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-xs text-text-secondary">
                      <Mail size={14} className="text-blue-500" /> {selectedUser.email || 'N/A'}
                   </div>
                   <div className="flex items-center gap-3 text-xs text-text-secondary">
                      <Phone size={14} className="text-blue-500" /> {selectedUser.phoneNumber || 'N/A'}
                   </div>
                   <div className="flex items-center gap-3 text-xs text-text-secondary">
                      <MapPin size={14} className="text-blue-500" /> {selectedUser.city || 'N/A'}
                   </div>
                   <div className="flex items-center gap-3 text-xs text-text-secondary">
                      <Calendar size={14} className="text-blue-500" /> Inscrit le {selectedUser.createdAt ? format(selectedUser.createdAt.toDate(), 'dd MMMM yyyy', { locale: fr }) : 'N/A'}
                   </div>
                </div>
             </div>

             <div className="mt-auto space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary italic">Actions Administration</h4>
                <div className="flex flex-col gap-2">
                   <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        className={cn("h-12 text-[9px] font-black uppercase tracking-widest border-border-subtle", selectedUser.role === 'manager' && "bg-accent-green/10 text-accent-green")}
                        onClick={() => changeRole(selectedUser.id, selectedUser.role === 'manager' ? 'user' : 'manager')}
                      >
                         Nommer Gérant
                      </Button>
                      <Button 
                        variant="outline" 
                        className={cn("h-12 text-[9px] font-black uppercase tracking-widest border-border-subtle", selectedUser.role === 'admin' && "bg-blue-500/10 text-blue-500")}
                        onClick={() => changeRole(selectedUser.id, selectedUser.role === 'admin' ? 'user' : 'admin')}
                      >
                         Nommer Admin
                      </Button>
                   </div>
                   <Button 
                     variant="outline" 
                     fullWidth
                     className={cn(
                        "h-12 text-[9px] font-black uppercase tracking-widest border-border-subtle",
                        selectedUser.isActive === false ? "text-accent-green" : "text-danger"
                     )}
                     onClick={() => toggleUserStatus(selectedUser.id, selectedUser.isActive !== false)}
                   >
                      {selectedUser.isActive === false ? <><Unlock size={14} className="mr-2" /> Réactiver le compte</> : <><Lock size={14} className="mr-2" /> Suspendre le compte</>}
                   </Button>
                </div>
             </div>
          </motion.aside>
        ) : (
          <div className="w-[380px] bg-background-card/30 border border-dashed border-border-subtle rounded-[40px] flex flex-col items-center justify-center p-12 text-center gap-4 opacity-30">
             <User size={48} />
             <p className="text-[10px] font-black uppercase tracking-widest">Sélectionnez un utilisateur pour voir les détails</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
