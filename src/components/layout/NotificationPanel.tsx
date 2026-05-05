import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '@/src/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Calendar,
  AlertTriangle,
  Trash2,
  Check,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { AppNotification } from '@/src/lib/schema';
import { EmptyState } from '@/src/components/ui/EmptyState';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotifications();
  const navigate = useNavigate();
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = async (n: AppNotification) => {
    if (!n.isRead) {
      await markAsRead(n.id);
    }
    
    onClose();

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
        return <CheckCircle2 className="text-accent-green" size={18} />;
      case 'reservation_cancel':
        return <XCircle className="text-red-500" size={18} />;
      case 'new_player_joined':
      case 'match_join':
        return <Users className="text-blue-500" size={18} />;
      case 'team_published':
        return <Calendar className="text-purple-500" size={18} />;
      default:
        return <Info className="text-text-tertiary" size={18} />;
    }
  };

  const listContent = (
    <div className="space-y-0.5">
      {notifications.length > 0 ? (
        notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleNotificationClick(n)}
            className={cn(
              "group relative flex items-start gap-4 p-4 cursor-pointer transition-all hover:bg-background-secondary border-l-3",
              !n.isRead ? "bg-accent-green/[0.03] border-accent-green" : "bg-transparent border-transparent"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl bg-background-secondary border border-border-subtle flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
              !n.isRead && "bg-white/5 shadow-sm"
            )}>
              {getIcon(n.type)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <p className={cn(
                  "text-[13px] font-semibold leading-tight font-sans",
                  !n.isRead ? "text-white" : "text-text-secondary"
                )}>
                  {n.title}
                </p>
                <p className="text-[10px] text-text-tertiary whitespace-nowrap pt-0.5 font-medium">
                  {n.createdAt ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true, locale: fr }) : 'maintenant'}
                </p>
              </div>
              <p className="text-[13px] text-text-secondary leading-normal line-clamp-2">
                {n.body}
              </p>
            </div>
          </div>
        ))
      ) : (
        <EmptyState 
          icon={Bell}
          title="AUCUNE NOTIFICATION"
          subtitle="Tu n'as reçu aucun message ou alerte pour le moment."
          className="py-12"
        />
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="hidden lg:block absolute top-[calc(100%+12px)] right-0 w-[380px] bg-background-card border border-border-subtle rounded-2xl shadow-2xl z-[150] overflow-hidden"
        >
          <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-background-card/50 backdrop-blur-md">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">NOTIFICATIONS</h3>
            <button 
              onClick={markAllAsRead}
              className="text-[10px] font-black uppercase tracking-widest text-accent-green hover:brightness-110 transition-all"
            >
              Tout marquer comme lu
            </button>
          </div>

          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            {listContent}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
