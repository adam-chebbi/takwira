import * as React from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Academy } from '@/src/lib/schema';

export const useAcademies = () => {
  const [academies, setAcademies] = React.useState<Academy[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const q = query(collection(db, 'academies'), where('isActive', '==', true), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setAcademies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Academy)));
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching academies:", err);
        setError(err as Error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { academies, isLoading, error };
};
