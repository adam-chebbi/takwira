import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function createNotification(
  userId: string,
  type: string,
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
      relatedId: relatedId || null,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    // Silently log errors; notification failure should not block main flows
    console.error('Error creating notification:', error);
  }
}
