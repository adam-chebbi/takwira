import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Complex, Terrain } from '@/src/lib/schema';

export function useManagerComplex(managerId: string | undefined) {
  const [complex, setComplex] = useState<Complex | null>(null);
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!managerId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const complexQuery = query(
      collection(db, 'complexes'),
      where('managerId', '==', managerId),
      limit(1)
    );

    const unsubscribeComplex = onSnapshot(
      complexQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const complexData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Complex;
          setComplex(complexData);

          const terrainsQuery = query(
            collection(db, 'terrains'),
            where('complexId', '==', complexData.id)
          );

          const unsubscribeTerrains = onSnapshot(
            terrainsQuery,
            (terrainSnapshot) => {
              const terrainList = terrainSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Terrain));
              setTerrains(terrainList);
              setIsLoading(false);
            },
            (err) => {
              console.error("Error fetching terrains:", err);
              setError(err as Error);
              setIsLoading(false);
            }
          );

          return () => unsubscribeTerrains();
        } else {
          setComplex(null);
          setTerrains([]);
          setIsLoading(false);
        }
      },
      (err) => {
        console.error("Error fetching complex:", err);
        setError(err as Error);
        setIsLoading(false);
      }
    );

    return () => unsubscribeComplex();
  }, [managerId]);

  return { complex, terrains, isLoading, error };
}
