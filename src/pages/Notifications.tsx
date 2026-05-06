import * as React from 'react';
import { motion } from 'motion/react';
import { useNotifications } from '@/src/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Calendar,
  Check,
  Info,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { AppNotification } from '@/src/lib/schema';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { useAuth } from '@/src/contexts/AuthContext';

export default function NotificationsPage() {
  const { userProfile } = useAuth();
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications(userProfile?.id);
  const navigate = useNavigate();

  const handleNotificationClick = async (n: AppNotification) => {
    if (!n.isRead) {
      await markAsRead(n.id);
    }
    
    if (n.relatedId) {
      if (n.type === 'reservation_confirm' || n.type === 'reservation_cancel') {
        navigate('/dashboard/reservations');
      } else if (n.type === 'team_published' || n.type === 'new_player_joined' || n.type === 'match_join') {
        navigate(`/match/${n.relatedId}`);
      }
    }
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'reservation_confirm':
        return <CheckCircle2 className="text-accent-green" size={20} />;
      case 'reservation_cancel':
        return <XCircle className="text-red-500" size={20} />;
      case 'new_player_joined':
      case 'match_join':
        return <Users className="text-blue-500" size={20} />;
      case 'team_published':
        return <Calendar className="text-purple-500" size={20} />;
      default:
        return <Info className="text-text-tertiary" size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-background-primary pb-20">
      <div className="sticky top-20 lg:top-[120px] z-30 bg-background-primary/80 backdrop-blur-xl border-b border-border-subtle p-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
           <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-text-primary">
              <ChevronLeft size={24} />
           </button>
           <h1 className="text-sm font-black uppercase tracking-widest text-text-primary">NOTIFICATIONS</h1>
           <div className="w-10" />
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="p-4 flex items-center justify-between">
           <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
             {unreadCount > 0 ? `${unreadCount} Non lues` : 'Toutes les notifications'}
           </p>
           {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] font-black uppercase tracking-widest text-accent-green flex items-center gap-2"
              >
                <Check size={14} /> Tout marquer comme lu
              </button>
           )}
        </div>

        <div className="bg-background-card border-y border-border-subtle divide-y divide-border-subtle">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => handleNotificationClick(n)}
                className={cn(
                  "flex items-start gap-4 p-4 active:bg-background-secondary transition-colors border-l-4",
                  !n.isRead ? "bg-accent-green/[0.03] border-accent-green" : "border-transparent"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl bg-background-secondary border border-border-subtle flex items-center justify-center shrink-0",
                  !n.isRead && "bg-white/5"
                )}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn(
                      "text-sm font-semibold leading-tight",
                      !n.isRead ? "text-text-primary" : "text-text-secondary"
                    )}>
                      {n.title}
                    </p>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {n.body}
                  </p>
                  <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-tight pt-1">
                    {n.createdAt ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true, locale: fr }) : 'maintenant'}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <EmptyState 
              icon={Bell}
              title="C'EST TOUT CALME"
              subtitle="Tu n'as aucune notification pour le moment."
              className="py-24"
            />
          )}
        </div>
      </div>
    </div>
  );
}
