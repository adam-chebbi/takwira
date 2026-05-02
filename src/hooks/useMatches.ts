import * as React from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Match } from '@/src/lib/schema';

export const useMatches = (filters?: { status?: Match['status'] }) => {
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'));

    if (filters?.status) {
      q = query(collection(db, 'matches'), where('status', '==', filters.status), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match)));
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching matches:", err);
        setError(err as Error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters?.status]);

  return { matches, isLoading, error };
};
