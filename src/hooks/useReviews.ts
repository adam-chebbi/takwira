import * as React from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Review } from '@/src/lib/schema';

export const useReviews = (terrainId: string | undefined) => {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!terrainId) return;

    const q = query(collection(db, 'reviews'), where('terrainId', '==', terrainId), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching reviews:", err);
        setError(err as Error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [terrainId]);

  return { reviews, isLoading, error };
};
