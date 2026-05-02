import * as React from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Complex, Terrain } from '@/src/lib/schema';

export const useComplex = (complexId: string | undefined) => {
  const [complex, setComplex] = React.useState<Complex | null>(null);
  const [terrains, setTerrains] = React.useState<Terrain[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!complexId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const complexDoc = await getDoc(doc(db, 'complexes', complexId));
        if (complexDoc.exists()) {
          setComplex({ id: complexDoc.id, ...complexDoc.data() } as Complex);
          
          // Fetch its terrains
          const q = query(collection(db, 'terrains'), where('complexId', '==', complexId));
          const snapshot = await getDocs(q);
          setTerrains(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Terrain)));
        }
      } catch (err) {
        console.error("Error fetching complex:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [complexId]);

  return { complex, terrains, isLoading, error };
};
