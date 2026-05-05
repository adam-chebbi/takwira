import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { AppNotification as Notification } from '@/src/lib/schema';
import { useAuth } from '@/src/contexts/AuthContext';

export function useNotifications(providedUserId?: string) {
  const { user } = useAuth();
  const userId = providedUserId || user?.uid;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifList = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
        setNotifications(notifList);
        setUnreadCount(notifList.filter(n => !n.isRead).length);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching notifications:", err);
        setError(err as Error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      await updateDoc(docRef, { isRead: true });
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const unreadNotifs = notifications.filter(n => !n.isRead);
      unreadNotifs.forEach(n => {
        batch.update(doc(db, 'notifications', n.id), { isRead: true });
      });
      await batch.commit();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const deleteNotification = async (id: string) => {
    // Basic implementation for delete
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'notifications', id));
  };

  return { notifications, unreadCount, isLoading, error, markAsRead, markAllAsRead, deleteNotification };
}
