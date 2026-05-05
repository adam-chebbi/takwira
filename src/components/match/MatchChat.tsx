import * as React from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { MatchMessage, User } from '@/src/lib/schema';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  MessageCircle, 
  X, 
  Trash2, 
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import { format, isSameDay, isYesterday, isToday, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MatchChatProps {
  matchId: string;
  currentUser: any | null; // From AuthContext
  userProfile: any | null;
  isOrganizer?: boolean;
  currentPlayerName?: string;
}

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500', 
    'bg-purple-500', 
    'bg-pink-500', 
    'bg-orange-500', 
    'bg-teal-500', 
    'bg-indigo-500',
    'bg-rose-500',
    'bg-amber-500'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const formatMessageDate = (date: Date) => {
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return `Hier, ${format(date, 'HH:mm')}`;
  return format(date, 'd MMMM, HH:mm', { locale: fr });
};

export default function MatchChat({ matchId, currentUser, userProfile, isOrganizer, currentPlayerName }: MatchChatProps) {
  const [messages, setMessages] = React.useState<MatchMessage[]>([]);
  const [inputText, setInputText] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [lastSeenTimestamp, setLastSeenTimestamp] = React.useState<number>(Date.now());
  const [userName, setUserName] = React.useState<string>(() => {
    return currentPlayerName || localStorage.getItem(`takwira_chat_name_${matchId}`) || '';
  });

  React.useEffect(() => {
    if (currentPlayerName) {
      setUserName(currentPlayerName);
    }
  }, [currentPlayerName]);

  const [isSettingName, setIsSettingName] = React.useState(!currentUser && !userName && !currentPlayerName);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isBottom = scrollHeight - scrollTop - clientHeight < 50;
      setIsAtBottom(isBottom);
    }
  };

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem(`takwira_chat_session_${matchId}`);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(`takwira_chat_session_${matchId}`, sessionId);
    }
    return sessionId;
  };

  // Load messages
  React.useEffect(() => {
    const q = query(
      collection(db, 'matchMessages'),
      where('matchId', '==', matchId),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as MatchMessage));
      
      setMessages(newMessages);

      // Handle unread count
      if (!isOpen) {
        const unread = newMessages.filter(m => {
          const createdAt = (m.createdAt as any)?.toMillis?.() || Date.now();
          return createdAt > lastSeenTimestamp;
        }).length;
        setUnreadCount(unread);
      }
    });

    return () => unsubscribe();
  }, [matchId, isOpen, lastSeenTimestamp]);

  // Scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current && (isAtBottom || behavior === 'auto')) {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setLastSeenTimestamp(Date.now());
      scrollToBottom('auto');
    }
  }, [isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text || text.length > 500) return;

    const finalSenderName = userProfile?.name || userName || 'Anonyme';
    const msgData = {
      matchId,
      senderId: currentUser?.uid || getSessionId(),
      senderName: finalSenderName,
      senderAvatarColor: getAvatarColor(finalSenderName),
      text,
      createdAt: serverTimestamp(),
      isDeleted: false
    };

    setInputText(''); // Optimistic clear
    try {
      await addDoc(collection(db, 'matchMessages'), msgData);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!isOrganizer) return;
    try {
      await updateDoc(doc(db, 'matchMessages', msgId), { isDeleted: true });
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleSetName = (e: React.FormEvent) => {
    e.preventDefault();
    const name = (e.target as any).name.value.trim();
    if (name) {
      setUserName(name);
      localStorage.setItem(`takwira_chat_name_${matchId}`, name);
      setIsSettingName(false);
    }
  };

  const renderMessage = (msg: MatchMessage, index: number) => {
    const sessionId = sessionStorage.getItem(`takwira_chat_session_${matchId}`);
    const isMe = msg.senderId === currentUser?.uid || (msg.senderId === sessionId && msg.senderId !== null);
    const prevMsg = messages[index - 1];
    const showName = !msg.isDeleted && (!prevMsg || prevMsg.senderId !== msg.senderId || prevMsg.senderName !== msg.senderName);
    
    // Time separator
    let showTimeSeparator = false;
    let separatorLabel = '';
    if (prevMsg && msg.createdAt && prevMsg.createdAt) {
      const timeDiff = differenceInMinutes(
        (msg.createdAt as any).toDate(),
        (prevMsg.createdAt as any).toDate()
      );
      if (timeDiff > 60) {
        showTimeSeparator = true;
        separatorLabel = formatMessageDate((msg.createdAt as any).toDate());
      }
    }

    return (
      <React.Fragment key={msg.id}>
        {showTimeSeparator && (
          <div className="flex justify-center my-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary bg-background-secondary px-3 py-1 rounded-full">
              {separatorLabel}
            </span>
          </div>
        )}
        
        <div className={cn(
          "flex flex-col mb-4 group",
          isMe ? "items-end" : "items-start"
        )}>
          {showName && !isMe && (
            <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-10 mb-1">
              {msg.senderName}
            </span>
          )}
          
          <div className={cn(
            "flex items-end gap-2 max-w-[85%]",
            isMe ? "flex-row-reverse" : "flex-row"
          )}>
            {!isMe && !msg.isDeleted && (
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm",
                msg.senderAvatarColor
              )}>
                {msg.senderName.charAt(0)}
              </div>
            )}
            
            {!isMe && msg.isDeleted && <div className="w-8 shrink-0" />}

            <div className="relative group/bubble flex items-center gap-2">
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm font-medium break-words",
                isMe 
                  ? "bg-accent-green text-black rounded-tr-none" 
                  : "bg-background-secondary text-white rounded-tl-none border border-border-subtle"
              )}>
                {msg.isDeleted ? (
                  <span className="italic text-text-tertiary text-xs">Message supprimé</span>
                ) : (
                  msg.text
                )}
                
                <div className={cn(
                  "text-[8px] font-bold mt-1 opacity-50",
                  isMe ? "text-black text-right" : "text-text-tertiary text-right"
                )}>
                  {msg.createdAt ? format((msg.createdAt as any).toDate(), 'HH:mm') : '...'}
                </div>
              </div>

              {isOrganizer && !isMe && !msg.isDeleted && (
                <div className="relative">
                  {deleteConfirmId === msg.id ? (
                    <div className="absolute left-2 bottom-0 flex items-center bg-background-card border border-border-subtle rounded-lg p-1 animate-in fade-in slide-in-from-left-2 z-10 shadow-xl min-w-[80px]">
                      <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="text-[8px] font-black uppercase text-danger hover:underline px-2"
                      >
                        Supprimer ?
                      </button>
                      <button 
                         onClick={() => setDeleteConfirmId(null)}
                         className="text-[8px] font-black uppercase text-text-tertiary px-2"
                      >
                        Non
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setDeleteConfirmId(msg.id)}
                      className="p-1 text-text-tertiary hover:text-danger opacity-0 group-hover/bubble:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  };

  const chatContent = (
    <div className="flex flex-col h-full bg-background-card border-l border-border-subtle shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-background-secondary/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center text-accent-green">
            <MessageCircle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-display font-black uppercase tracking-tight text-white leading-none">Chat du Match</h3>
            <p className="text-[9px] font-black text-accent-green uppercase tracking-widest mt-1">
              {messages.length} messages • Live
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden w-8 h-8 rounded-lg hover:bg-background-secondary flex items-center justify-center text-text-tertiary"
        >
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
            <MessageCircle size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Commencez la discussion</p>
          </div>
        ) : (
          messages.map((msg, i) => renderMessage(msg, i))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input / Identity */}
      <div className="p-4 border-t border-border-subtle bg-background-secondary/30 relative">
        {inputText.length > 400 && (
          <span className={cn(
            "absolute -top-6 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full",
            inputText.length > 480 ? "text-danger bg-danger/10" : "text-text-tertiary bg-background-secondary"
          )}>
            {inputText.length} / 500
          </span>
        )}

        {isSettingName ? (
          <form onSubmit={handleSetName} className="space-y-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-text-tertiary text-center">
              Entre ton prénom pour participer au chat
            </p>
            <div className="flex gap-2">
              <input 
                name="name"
                required
                placeholder="Ton prénom..."
                className="flex-1 bg-background-secondary border border-border-subtle rounded-xl px-4 h-11 text-xs focus:border-accent-green outline-none text-white"
              />
              <Button type="submit" size="sm" className="h-11 px-4 text-[10px] bg-accent-green text-black uppercase font-black">Rejoindre</Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Écrire un message..."
              maxLength={500}
              className="flex-1 bg-background-secondary border border-border-subtle rounded-xl px-4 h-12 text-sm focus:border-accent-green outline-none text-white transition-all placeholder:text-text-tertiary"
            />
            <Button 
              type="submit" 
              disabled={!inputText.trim() || inputText.length > 500}
              size="icon" 
              className={cn(
                "h-12 w-12 rounded-xl shrink-0 transition-all",
                inputText.trim() && inputText.length <= 500 ? "bg-accent-green text-black" : "bg-background-secondary text-text-tertiary opacity-50"
              )}
            >
              <Send size={18} />
            </Button>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Panel */}
      <div className="hidden lg:block w-[380px] h-[calc(100vh-64px)] fixed top-[64px] right-0 z-30">
        {chatContent}
      </div>

      {/* Mobile Floating Button */}
      <div className="lg:hidden fixed bottom-24 right-6 z-40">
        <button 
          onClick={() => setIsOpen(true)}
          className="w-[52px] h-[52px] rounded-full bg-accent-green text-black shadow-[0_10px_30px_rgba(34,197,94,0.4)] flex items-center justify-center relative hover:scale-110 transition-transform active:scale-95"
        >
          <MessageCircle size={24} />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-danger text-white text-[10px] font-black border-2 border-background-primary flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[50]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 h-[75vh] bg-background-card rounded-t-[32px] overflow-hidden z-[51] shadow-2xl"
            >
              {chatContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
