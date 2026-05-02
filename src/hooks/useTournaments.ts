import * as React from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Tournament } from '@/src/lib/schema';

export const useTournaments = (filters?: { status?: Tournament['status'] }) => {
  const [tournaments, setTournaments] = React.useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'));

    if (filters?.status) {
      q = query(collection(db, 'tournaments'), where('status', '==', filters.status), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setTournaments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tournament)));
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching tournaments:", err);
        setError(err as Error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters?.status]);

  return { tournaments, isLoading, error };
};
