import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Calendar, 
  CreditCard, 
  ChevronRight, 
  LogOut, 
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { cn } from '@/src/lib/utils';

// --- Mock Data ---
interface Member {
  id: string;
  name: string;
  phone: string;
  subscription: 'Mensuel' | 'Trimestriel' | 'Annuel';
  startDate: string;
  endDate: string;
  status: 'active' | 'expiring' | 'expired';
}

const MEMBERS: Member[] = [
  { id: '1', name: 'Zied Ayari', phone: '55 111 222', subscription: 'Mensuel', startDate: '2026-04-01', endDate: '2026-05-01', status: 'expiring' },
  { id: '2', name: 'Youssef Msakni', phone: '22 888 777', subscription: 'Trimestriel', startDate: '2026-03-15', endDate: '2026-06-15', status: 'active' },
  { id: '3', name: 'Mourad Trabelsi', phone: '98 777 666', subscription: 'Mensuel', startDate: '2026-03-01', endDate: '2026-04-01', status: 'expired' },
];

export default function DashboardAcademies() {
  const [members, setMembers] = React.useState(MEMBERS);
  const [filter, setFilter] = React.useState<'Tous' | 'Actif' | 'Expired'>('Tous');

  return (
    <div className="p-6 md:p-10 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-black uppercase tracking-tight text-white">Gestion Académie</h1>
          <p className="text-text-secondary font-medium uppercase tracking-widest text-[10px]">Suivi des membres et abonnements</p>
        </div>
        <Button className="h-12 px-8 uppercase font-black text-xs tracking-widest gap-2">
           <UserPlus size={18} /> Ajouter un membre
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "Membres Actifs", val: 124, icon: Users, color: "text-accent-green" },
           { label: "Expirant ce mois", val: 18, icon: Clock, color: "text-warning" },
           { label: "Renouvellements", val: 540, icon: CreditCard, color: "text-white", suffix: "DT" }
         ].map((stat, i) => (
           <Card key={i} className="p-6 border-border-subtle bg-background-card overflow-hidden group">
              <div className="absolute inset-0 bg-accent-green/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between relative">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{stat.label}</p>
                    <p className={cn("text-3xl font-display font-black", stat.color)}>{stat.val}{stat.suffix}</p>
                 </div>
                 <stat.icon className="text-text-tertiary group-hover:text-accent-green transition-colors" size={24} />
              </div>
           </Card>
         ))}
      </div>

      {/* Member List */}
      <section className="space-y-6">
         <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
               <input 
                 type="text" 
                 placeholder="Rechercher un membre..."
                 className="w-full bg-background-secondary border border-border-subtle rounded-xl pl-12 pr-4 h-12 text-sm focus:border-accent-green outline-none"
               />
            </div>
            <div className="flex bg-background-secondary p-1 rounded-xl border border-border-subtle h-12 w-full md:w-auto">
               {['Tous', 'Actif', 'Expired'].map((f) => (
                 <button 
                   key={f}
                   onClick={() => setFilter(f as any)}
                   className={cn(
                     "px-6 text-[10px] font-black uppercase tracking-widest rounded-lg flex-1",
                     filter === f ? "bg-accent-green text-black" : "text-text-tertiary hover:text-white"
                   )}
                 >
                   {f}
                 </button>
               ))}
            </div>
         </div>

         <div className="bg-background-card rounded-[24px] border border-border-subtle overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-background-secondary/50 border-b border-border-subtle">
                     <tr>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Membre</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Abonnement</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Période</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Statut</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {members.map((m) => (
                       <tr key={m.id} className="border-b border-border-subtle hover:bg-background-primary transition-colors group">
                          <td className="p-6">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-background-secondary flex items-center justify-center font-display font-black text-xs border border-border-subtle">
                                   {m.name.split(' ')[0][0]}
                                </div>
                                <div className="space-y-0.5">
                                   <p className="font-bold text-sm uppercase tracking-wider">{m.name}</p>
                                   <p className="text-[10px] text-text-tertiary font-bold">{m.phone}</p>
                                </div>
                             </div>
                          </td>
                          <td className="p-6">
                             <Badge className="bg-background-secondary text-text-tertiary border-none font-black text-[9px] h-6">
                                {m.subscription}
                             </Badge>
                          </td>
                          <td className="p-6">
                             <div className="text-[10px] font-bold text-text-secondary uppercase">
                                {m.startDate} <span className="mx-2 text-text-tertiary">→</span> {m.endDate}
                             </div>
                          </td>
                          <td className="p-6">
                             <Badge className={cn(
                               "h-7 px-3 font-black text-[9px] uppercase tracking-widest",
                               m.status === 'active' ? "bg-accent-green/10 text-accent-green" :
                               m.status === 'expiring' ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"
                             )}>
                                {m.status === 'active' ? 'Actif' : m.status === 'expiring' ? 'Expire bientôt' : 'Expiré'}
                             </Badge>
                          </td>
                          <td className="p-6">
                             <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="h-10 text-[9px] font-black border-border-subtle hover:text-accent-green gap-2">
                                   <RotateCcw size={12} /> Renouveler
                                </Button>
                                <button className="p-2 text-text-tertiary hover:text-white"><MoreVertical size={18} /></button>
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </section>

    </div>
  );
}
