import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Terrain, Complex } from '@/src/lib/schema';

export function useTerrain(terrainId: string | undefined) {
  const [terrain, setTerrain] = useState<Terrain | null>(null);
  const [complex, setComplex] = useState<Complex | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!terrainId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const terrainDoc = await getDoc(doc(db, 'terrains', terrainId));
        if (terrainDoc.exists()) {
          const terrainData = { id: terrainDoc.id, ...terrainDoc.data() } as Terrain;
          setTerrain(terrainData);

          if (terrainData.complexId) {
            const complexDoc = await getDoc(doc(db, 'complexes', terrainData.complexId));
            if (complexDoc.exists()) {
              setComplex({ id: complexDoc.id, ...complexDoc.data() } as Complex);
            }
          }
        } else {
          setTerrain(null);
          setComplex(null);
        }
      } catch (err) {
        console.error("Error fetching terrain:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [terrainId]);

  return { terrain, complex, isLoading, error };
}
