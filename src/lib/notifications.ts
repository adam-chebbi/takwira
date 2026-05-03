import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export type NotificationType = 
  | 'reservation_confirmed' 
  | 'reservation_cancelled' 
  | 'match_full' 
  | 'team_published' 
  | 'new_player_joined' 
  | 'academy_expiring' 
  | 'general';

/**
 * Creates a notification in Firestore for a specific user
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  relatedId?: string
) {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      title,
      body,
      relatedId,
      isRead: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}
