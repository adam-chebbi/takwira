import * as React from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  getCountFromServer,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { motion } from 'motion/react';
import { 
  Users, 
  MapPin, 
  CalendarCheck, 
  Activity, 
  FileText, 
  Megaphone,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Search,
  Check,
  X
} from 'lucide-react';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/src/lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    verifiedComplexes: 0,
    monthReservations: 0,
    activeTerrains: 0,
    publishedPosts: 0,
    activeAds: 0
  });

  const [pendingComplexes, setPendingComplexes] = React.useState<any[]>([]);
  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchKPIs() {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        usersCount,
        complexesCount,
        reservationsCount,
        terrainsCount,
        postsCount,
        adsCount
      ] = await Promise.all([
        getCountFromServer(collection(db, 'users')),
        getCountFromServer(query(collection(db, 'complexes'), where('isVerified', '==', true))),
        getCountFromServer(query(collection(db, 'reservations'), where('createdAt', '>=', Timestamp.fromDate(startOfMonth)))),
        getCountFromServer(query(collection(db, 'terrains'), where('status', '==', 'active'))),
        getCountFromServer(query(collection(db, 'blogPosts'), where('status', '==', 'published'))),
        getCountFromServer(query(collection(db, 'adSlots'), where('isActive', '==', true)))
      ]);

      setStats({
        totalUsers: usersCount.data().count,
        verifiedComplexes: complexesCount.data().count,
        monthReservations: reservationsCount.data().count,
        activeTerrains: terrainsCount.data().count,
        publishedPosts: postsCount.data().count,
        activeAds: adsCount.data().count
      });
    }

    fetchKPIs();

    // Pending Complexes sub
    const qPending = query(collection(db, 'complexes'), where('isVerified', '==', false), orderBy('createdAt', 'desc'));
    const unsubPending = onSnapshot(qPending, (snap) => {
      setPendingComplexes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Recent Activity (simulated by latest reservations and users)
    const qActivity = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'), limit(10));
    const unsubActivity = onSnapshot(qActivity, (snap) => {
      setRecentActivity(snap.docs.map(doc => ({ 
        id: doc.id, 
        type: 'reservation',
        ...doc.data() 
      })));
      setLoading(false);
    });

    return () => {
      unsubPending();
      unsubActivity();
    };
  }, []);

  const handleVerifyComplex = async (complexId: string, managerId: string) => {
    try {
      await updateDoc(doc(db, 'complexes', complexId), { isVerified: true });
      // Send notification (pseudo-code/simulated)
      const notifRef = collection(db, 'notifications');
      // In a real app we'd trigger a cloud function or write here
      console.log(`Verified complex ${complexId} for manager ${managerId}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-12">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Utilisateurs', value: stats.totalUsers, icon: Users, color: 'text-blue-500' },
          { label: 'Complexes', value: stats.verifiedComplexes, icon: MapPin, color: 'text-accent-green' },
          { label: 'Réservations', value: stats.monthReservations, icon: CalendarCheck, color: 'text-purple-500' },
          { label: 'Terrains', value: stats.activeTerrains, icon: Activity, color: 'text-amber-500' },
          { label: 'Articles', value: stats.publishedPosts, icon: FileText, color: 'text-rose-500' },
          { label: 'Publicités', value: stats.activeAds, icon: Megaphone, color: 'text-indigo-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-6 bg-background-card border border-border-subtle rounded-3xl"
          >
            <div className={cn("w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center mb-4", stat.color)}>
              <stat.icon size={20} />
            </div>
            <p className="text-3xl font-display font-black text-white">{stat.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Pending Verifications */}
        <div className="xl:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <h2 className="text-xl font-display font-black uppercase tracking-tight text-white">Complexes en attente</h2>
                 <Badge className="bg-amber-500/10 text-amber-500 border-none">{pendingComplexes.length}</Badge>
              </div>
              <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-blue-500">Voir tout</Button>
           </div>

           <div className="bg-background-card border border-border-subtle rounded-[32px] overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-background-secondary/50 border-b border-border-subtle">
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Complexe</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Gérant</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Inscrit</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                       {pendingComplexes.length > 0 ? pendingComplexes.map((c) => (
                         <tr key={c.id} className="hover:bg-background-secondary/20 transition-colors">
                            <td className="px-6 py-4">
                               <div className="space-y-0.5">
                                  <p className="text-sm font-bold text-white">{c.name}</p>
                                  <p className="text-[10px] text-text-tertiary flex items-center gap-1"><MapPin size={10} /> {c.city}</p>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="space-y-0.5">
                                  <p className="text-xs text-text-secondary">{c.managerName || 'Prénom Nom'}</p>
                                  <p className="text-[10px] text-text-tertiary font-mono">{c.managerPhone || '22 123 456'}</p>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-[10px] text-text-tertiary uppercase font-black">
                               {c.createdAt ? formatDistanceToNow(c.createdAt.toDate(), { addSuffix: true, locale: fr }) : 'Récemment'}
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => handleVerifyComplex(c.id, c.managerId)}
                                    className="w-8 h-8 rounded-lg bg-accent-green/10 text-accent-green flex items-center justify-center hover:bg-accent-green hover:text-black transition-all"
                                  >
                                     <Check size={16} />
                                  </button>
                                  <button className="w-8 h-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-all">
                                     <X size={16} />
                                  </button>
                               </div>
                            </td>
                         </tr>
                       )) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-2 opacity-30">
                              <CheckCircle2 size={40} />
                              <p className="text-[10px] font-black uppercase tracking-widest">Aucune demande en attente</p>
                            </div>
                          </td>
                        </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
           <h2 className="text-xl font-display font-black uppercase tracking-tight text-white">Activité Récente</h2>
           <div className="bg-background-card border border-border-subtle rounded-[32px] p-6 space-y-6">
              {recentActivity.map((activity, i) => (
                <div key={activity.id} className="flex gap-4 relative">
                   {i !== recentActivity.length - 1 && (
                     <div className="absolute left-[19px] top-10 bottom-0 w-[2px] bg-border-subtle" />
                   )}
                   <div className="w-10 h-10 rounded-xl bg-background-secondary border border-border-subtle flex items-center justify-center shrink-0 relative z-10 text-blue-500">
                      <CalendarCheck size={18} />
                   </div>
                   <div className="space-y-1 py-1">
                      <p className="text-xs text-text-secondary">
                         Nouvelle réservation pour <span className="font-bold text-white">{activity.terrainName || 'Terrain'}</span>
                      </p>
                      <p className="text-[10px] text-text-tertiary flex items-center gap-1 italic">
                         <Clock size={10} /> {activity.createdAt ? formatDistanceToNow(activity.createdAt.toDate(), { addSuffix: true, locale: fr }) : 'Maintenant'}
                      </p>
                   </div>
                </div>
              ))}

              {recentActivity.length === 0 && (
                <div className="py-12 text-center opacity-30">
                   <p className="text-[10px] font-black uppercase tracking-widest">Aucune activité enregistrée</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
