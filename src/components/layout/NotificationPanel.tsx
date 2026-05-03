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
  Info,
  Calendar,
  AlertTriangle,
  Trash2,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { BottomSheet } from '@/src/components/ui/BottomSheet';
import { AppNotification } from '@/src/lib/schema';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
}

export function NotificationPanel({ isOpen, onClose, anchorEl }: NotificationPanelProps) {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = async (n: AppNotification) => {
    if (!n.isRead) {
      await markAsRead(n.id);
    }
    
    onClose();

    if (n.relatedId) {
      if (n.type.startsWith('reservation')) {
        navigate('/profil?tab=matchs'); // Or a specific reservation page if exists
      } else if (n.type === 'team_published' || n.type === 'new_player_joined') {
        navigate(`/match/${n.relatedId}`);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'reservation_confirmed':
        return <CheckCircle2 className="text-accent-green" size={18} />;
      case 'reservation_cancelled':
        return <XCircle className="text-danger" size={18} />;
      case 'new_player_joined':
        return <Users className="text-blue-500" size={18} />;
      case 'team_published':
        return <Calendar className="text-purple-500" size={18} />;
      case 'academy_expiring':
        return <AlertTriangle className="text-amber-500" size={18} />;
      default:
        return <Bell className="text-text-tertiary" size={18} />;
    }
  };

  const listContent = (
    <div className="space-y-1 py-1">
      {notifications.length > 0 ? (
        notifications.map((n) => (
          <motion.div
            key={n.id}
            drag="x"
            dragConstraints={{ left: -100, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) {
                deleteNotification(n.id);
              }
            }}
            className="relative"
          >
            {/* Delete Background Indicator */}
            <div className="absolute inset-0 bg-danger flex items-center justify-end px-6 rounded-2xl">
              <Trash2 size={20} className="text-white" />
            </div>

            <motion.div
              onClick={() => handleNotificationClick(n)}
              className={cn(
                "group relative flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:bg-background-secondary bg-background-card",
                !n.isRead && "bg-accent-green/[0.03] border-l-2 border-accent-green"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl bg-background-secondary border border-border-subtle flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                !n.isRead && "bg-white/5"
              )}>
                {getIcon(n.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn(
                    "text-xs font-bold leading-tight",
                    !n.isRead ? "text-white" : "text-text-secondary"
                  )}>
                    {n.title}
                  </p>
                  <p className="text-[9px] text-text-tertiary whitespace-nowrap pt-0.5">
                    {n.createdAt ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true, locale: fr }) : 'Maintenant'}
                  </p>
                </div>
                <p className="text-[11px] text-text-tertiary leading-relaxed line-clamp-2">
                  {n.body}
                </p>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(n.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 text-text-tertiary hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          </motion.div>
        ))
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-[32px] bg-background-secondary border border-border-subtle flex items-center justify-center text-text-tertiary mb-6">
            <Bell size={32} className="opacity-20" />
          </div>
          <h4 className="text-sm font-black uppercase tracking-widest text-white mb-2">Pas de notifications</h4>
          <p className="text-xs text-text-tertiary max-w-[200px]">
            Vous serez averti ici dès qu'il se passera quelque chose de nouveau.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="hidden lg:block fixed right-4 top-20 w-[380px] bg-background-card border border-border-subtle rounded-[24px] shadow-2xl z-[150] overflow-hidden backdrop-blur-xl"
          >
            <div className="p-5 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-accent-green text-[8px] font-black text-black">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button 
                onClick={markAllAsRead}
                className="text-[9px] font-black uppercase tracking-widest text-accent-green hover:brightness-110 flex items-center gap-1.5 transition-all"
              >
                <Check size={12} /> Tout marquer comme lu
              </button>
            </div>

            <div className="max-h-[480px] overflow-y-auto px-2">
              {listContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Sheet */}
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title="Notifications"
      >
        <div className="pb-6">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="w-full h-12 rounded-2xl bg-background-secondary border border-border-subtle flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-accent-green mb-4"
            >
              <Check size={16} /> Tout marquer comme lu
            </button>
          )}
          {listContent}
        </div>
      </BottomSheet>

      {/* Desktop Backdrop close trigger */}
      <AnimatePresence>
        {isOpen && (
          <div 
            onClick={onClose}
            className="hidden lg:block fixed inset-0 z-[140]"
          />
        )}
      </AnimatePresence>
    </>
  );
}
