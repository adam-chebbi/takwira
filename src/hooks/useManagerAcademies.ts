import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Academy } from '@/src/lib/schema';

export function useManagerAcademies(managerId: string | undefined) {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!managerId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const q = query(
      collection(db, 'academies'),
      where('managerId', '==', managerId),
      where('isActive', '==', true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const academyList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Academy));
        setAcademies(academyList);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching academies:", err);
        setError(err as Error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [managerId]);

  return { academies, isLoading, error };
}
