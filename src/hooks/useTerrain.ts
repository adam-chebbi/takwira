import * as React from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Terrain, Complex } from '@/src/lib/schema';

export const useTerrain = (terrainId: string | undefined) => {
  const [terrain, setTerrain] = React.useState<Terrain | null>(null);
  const [complex, setComplex] = React.useState<Complex | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!terrainId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const terrainDoc = await getDoc(doc(db, 'terrains', terrainId));
        if (terrainDoc.exists()) {
          const terrainData = { id: terrainDoc.id, ...terrainDoc.data() } as Terrain;
          setTerrain(terrainData);

          // Fetch Complex
          const complexDoc = await getDoc(doc(db, 'complexes', terrainData.complexId));
          if (complexDoc.exists()) {
            setComplex({ id: complexDoc.id, ...complexDoc.data() } as Complex);
          }
        }
      } catch (err) {
        console.error("Error fetching terrain/complex:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [terrainId]);

  return { terrain, complex, isLoading, error };
};
