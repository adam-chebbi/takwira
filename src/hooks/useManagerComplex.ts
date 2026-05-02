import * as React from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Complex, Terrain } from '@/src/lib/schema';

export const useManagerComplex = (managerId: string | undefined) => {
  const [complex, setComplex] = React.useState<Complex | null>(null);
  const [terrains, setTerrains] = React.useState<Terrain[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!managerId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, 'complexes'), where('managerId', '==', managerId), limit(1));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const complexDoc = snapshot.docs[0];
          const complexData = { id: complexDoc.id, ...complexDoc.data() } as Complex;
          setComplex(complexData);
          
          // Fetch its terrains
          const qT = query(collection(db, 'terrains'), where('complexId', '==', complexData.id));
          const snapshotT = await getDocs(qT);
          setTerrains(snapshotT.docs.map(doc => ({ id: doc.id, ...doc.data() } as Terrain)));
        }
      } catch (err) {
        console.error("Error fetching manager complex:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [managerId]);

  return { complex, terrains, isLoading, error };
};
