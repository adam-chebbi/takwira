import * as React from 'react';
import { collection, query, onSnapshot, doc, updateDoc, where, orderBy } from 'firebase/firestore';
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
  Unlock,
  Eye,
  EyeOff,
  UserCheck,
  ShieldCheck,
  LayoutDashboard
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
  const [revealedPhones, setRevealedPhones] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredUsers = users.filter(u => {
    const nameStr = u.displayName || u.name || '';
    const matchesSearch = nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.phone?.includes(searchTerm) || u.phoneNumber?.includes(searchTerm);
    
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

  const getPhoneDisplay = (userId: string, phone?: string) => {
    if (!phone) return 'N/A';
    if (revealedPhones[userId]) return phone;
    if (phone.length < 4) return '•• ••• ••';
    return phone.substring(0, 2) + ' •• ••• ' + phone.substring(phone.length - 2);
  };

  const togglePhoneReveal = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setRevealedPhones(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const roles = [
    { id: 'all', label: 'Tous', icon: Filter },
    { id: 'user', label: 'Joueurs', icon: User },
    { id: 'manager', label: 'Gérants', icon: LayoutDashboard },
    { id: 'admin', label: 'Admins', icon: ShieldCheck }
  ];

  return (
    <div className="flex gap-8 h-[calc(100vh-160px)]">
      {/* Left List */}
      <div className="flex-1 flex flex-col gap-6">
         <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <h1 className="text-3xl font-display font-black uppercase tracking-tight text-white italic">Utilisateurs</h1>
            
            <div className="flex flex-col md:flex-row items-center gap-4">
               {/* Role Pills */}
               <div className="flex items-center p-1 bg-background-card border border-border-subtle rounded-2xl overflow-x-auto max-w-full">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setRoleFilter(role.id as any)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                        roleFilter === role.id ? "bg-accent-green text-black" : "text-text-tertiary hover:text-white"
                      )}
                    >
                      <role.icon size={14} />
                      {role.label}
                    </button>
                  ))}
               </div>

               <div className="relative group w-full md:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                     type="text"
                     placeholder="Rechercher par nom..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full h-11 bg-background-card border border-border-subtle rounded-2xl pl-12 pr-4 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                  />
               </div>
            </div>
         </div>

         <div className="flex-1 bg-background-card border border-border-subtle rounded-[40px] overflow-hidden flex flex-col shadow-xl">
            <div className="overflow-auto flex-1">
               <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10">
                     <tr className="bg-background-secondary border-b border-border-subtle">
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Utilisateur</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Téléphone</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary text-center">Rôle</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Ville</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Inscription</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary text-center">Statut</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                     {filteredUsers.map((u) => (
                       <tr 
                         key={u.id}
                         onClick={() => setSelectedUser(u)}
                         className={cn(
                           "cursor-pointer transition-all",
                           selectedUser?.id === u.id ? "bg-accent-green/5" : "hover:bg-background-secondary/30",
                           u.isActive === false && "opacity-60"
                         )}
                       >
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center text-text-tertiary font-black uppercase overflow-hidden border border-border-subtle shrink-0">
                                   {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> : (u.displayName || u.name || '??').substring(0, 2)}
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                   <p className="text-sm font-bold text-white truncate">{u.displayName || u.name || 'Utilisateur Anonyme'}</p>
                                   <p className="text-[10px] text-text-tertiary truncate">{u.email}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2 group/phone">
                                <span className="font-mono text-[11px] text-text-secondary">
                                   {getPhoneDisplay(u.id, u.phone || u.phoneNumber)}
                                </span>
                                <button 
                                  onClick={(e) => togglePhoneReveal(e, u.id)}
                                  className="w-6 h-6 rounded-lg bg-background-secondary flex items-center justify-center opacity-0 group-hover/phone:opacity-100 transition-opacity text-text-tertiary hover:text-white"
                                >
                                   {revealedPhones[u.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                                </button>
                             </div>
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
                                {u.role === 'manager' ? 'Gérant' : u.role === 'admin' ? 'Admin' : 'Joueur'}
                             </Badge>
                          </td>
                          <td className="px-8 py-6 text-[10px] text-text-secondary uppercase font-black">
                             {u.city || '-'}
                          </td>
                          <td className="px-8 py-6 text-[10px] text-text-tertiary font-black uppercase">
                             {u.createdAt ? format((u.createdAt as any).toDate(), 'dd/MM/yy', { locale: fr }) : '-'}
                          </td>
                          <td className="px-8 py-6 text-center">
                             <div className={cn(
                               "w-2 h-2 rounded-full mx-auto",
                               u.isActive === false ? "bg-danger" : "bg-accent-green"
                             )} />
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
            className="w-[380px] bg-background-card border border-border-subtle rounded-[40px] p-8 flex flex-col gap-8 shadow-2xl relative overflow-hidden"
          >
             {/* Background glow */}
             <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent-green/5 blur-[80px] rounded-full pointer-events-none" />

             <button 
               onClick={() => setSelectedUser(null)}
               className="absolute top-6 right-6 w-10 h-10 rounded-full bg-background-secondary flex items-center justify-center text-text-tertiary hover:text-white transition-all hover:scale-110 active:scale-95"
             >
                <ChevronRight size={20} />
             </button>

             <div className="flex flex-col items-center text-center gap-5 mt-6">
                <div className="w-24 h-24 rounded-[32px] bg-background-secondary flex items-center justify-center text-white text-3xl font-black uppercase border border-border-subtle shadow-xl overflow-hidden">
                   {selectedUser.photoURL ? <img src={selectedUser.photoURL} alt="" className="w-full h-full object-cover" /> : (selectedUser.displayName || selectedUser.name || '??').substring(0, 1)}
                </div>
                <div className="space-y-1">
                   <h2 className="text-2xl font-display font-black uppercase tracking-tight text-white">{selectedUser.displayName || selectedUser.name}</h2>
                   <Badge className={cn(
                     "border-none px-3 uppercase text-[9px] tracking-[0.2em] font-black",
                     selectedUser.role === 'admin' ? "bg-blue-500 text-white" :
                     selectedUser.role === 'manager' ? "bg-accent-green text-black" :
                     "bg-background-secondary text-text-tertiary"
                   )}>
                     {selectedUser.role === 'manager' ? 'Gérant de complexe' : selectedUser.role === 'admin' ? 'Administrateur' : 'Joueur de foot'}
                   </Badge>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-3xl bg-background-secondary/30 border border-border-subtle/50 backdrop-blur-sm">
                   <p className="text-2xl font-display font-black text-white">0</p>
                   <p className="text-[9px] font-black uppercase tracking-widest text-text-tertiary mb-1">Matchs</p>
                   <div className="h-1 w-8 bg-accent-green/20 rounded-full" />
                </div>
                <div className="p-4 rounded-3xl bg-background-secondary/30 border border-border-subtle/50 backdrop-blur-sm">
                   <p className="text-2xl font-display font-black text-white">0</p>
                   <p className="text-[9px] font-black uppercase tracking-widest text-text-tertiary mb-1">Réservations</p>
                   <div className="h-1 w-8 bg-pl-purple/20 rounded-full" />
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary italic flex items-center gap-2">
                   <Filter size={12} /> Informations du profil
                </h4>
                <div className="space-y-3 bg-background-secondary/20 p-5 rounded-[28px] border border-border-subtle">
                   <div className="flex items-center gap-4 text-xs text-text-secondary group">
                      <div className="w-8 h-8 rounded-xl bg-background-card flex items-center justify-center text-text-tertiary group-hover:text-blue-500 transition-colors"><Mail size={14} /></div>
                      <span className="font-medium truncate">{selectedUser.email || 'Pas d\'email'}</span>
                   </div>
                   <div className="flex items-center gap-4 text-xs text-text-secondary group">
                      <div className="w-8 h-8 rounded-xl bg-background-card flex items-center justify-center text-text-tertiary group-hover:text-amber-500 transition-colors"><Phone size={14} /></div>
                      <span className="font-mono">{selectedUser.phone || selectedUser.phoneNumber || 'N/A'}</span>
                   </div>
                   <div className="flex items-center gap-4 text-xs text-text-secondary group">
                      <div className="w-8 h-8 rounded-xl bg-background-card flex items-center justify-center text-text-tertiary group-hover:text-accent-green transition-colors"><MapPin size={14} /></div>
                      <span className="font-medium">{selectedUser.city || 'N/A'}</span>
                   </div>
                   <div className="flex items-center gap-4 text-xs text-text-secondary group">
                      <div className="w-8 h-8 rounded-xl bg-background-card flex items-center justify-center text-text-tertiary group-hover:text-pl-purple transition-colors"><Calendar size={14} /></div>
                      <span className="font-medium">Inscrit le {selectedUser.createdAt ? format((selectedUser.createdAt as any).toDate(), 'dd MMMM yyyy', { locale: fr }) : 'N/A'}</span>
                   </div>
                </div>
             </div>

             <div className="mt-auto space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary italic">Actions Administration</h4>
                <div className="flex flex-col gap-3">
                   <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        className={cn(
                          "h-12 text-[10px] font-black uppercase tracking-widest border-border-subtle rounded-2xl", 
                          selectedUser.role === 'manager' ? "bg-accent-green/10 text-accent-green border-accent-green/30" : "hover:bg-accent-green/10 hover:text-accent-green group"
                        )}
                        onClick={() => changeRole(selectedUser.id, selectedUser.role === 'manager' ? 'user' : 'manager')}
                      >
                         <UserCheck size={14} className="mr-2 group-hover:scale-110 transition-transform" /> {selectedUser.role === 'manager' ? 'Démouvoir' : 'Gérant'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className={cn(
                          "h-12 text-[10px] font-black uppercase tracking-widest border-border-subtle rounded-2xl", 
                          selectedUser.role === 'admin' ? "bg-blue-500/10 text-blue-500 border-blue-500/30" : "hover:bg-blue-500/10 hover:text-blue-500 group"
                        )}
                        onClick={() => changeRole(selectedUser.id, selectedUser.role === 'admin' ? 'user' : 'admin')}
                      >
                         <ShieldCheck size={14} className="mr-2 group-hover:scale-110 transition-transform" /> {selectedUser.role === 'admin' ? 'Démouvoir' : 'Admin'}
                      </Button>
                   </div>
                   <Button 
                     variant="outline" 
                     fullWidth
                     className={cn(
                        "h-14 text-[11px] font-black uppercase tracking-widest border-border-subtle rounded-2xl transition-all",
                        selectedUser.isActive === false ? "bg-accent-green text-black border-none" : "text-danger border-danger/20 hover:bg-danger hover:text-white"
                     )}
                     onClick={() => toggleUserStatus(selectedUser.id, selectedUser.isActive !== false)}
                   >
                      {selectedUser.isActive === false ? (
                        <><Unlock size={18} className="mr-2" /> Réactiver le compte</>
                      ) : (
                        <><Lock size={18} className="mr-2" /> Désactiver l'accès</>
                      )}
                   </Button>
                </div>
             </div>
          </motion.aside>
        ) : (
          <div className="w-[380px] bg-background-card/20 border border-dashed border-border-subtle rounded-[40px] flex flex-col items-center justify-center p-12 text-center gap-6 opacity-30">
             <div className="w-20 h-20 rounded-full border-2 border-dashed border-border-subtle flex items-center justify-center">
                <User size={48} />
             </div>
             <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Sélectionnez un profil</p>
                <p className="text-[10px] text-text-tertiary">Cliquez sur une ligne pour voir les détails et les actions</p>
             </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
