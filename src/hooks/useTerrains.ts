import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, QueryConstraint } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Terrain } from '@/src/lib/schema';

interface TerrainFilters {
  city?: string;
  type?: string;
  complexId?: string;
}

export function useTerrains(filters?: TerrainFilters) {
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    
    const constraints: QueryConstraint[] = [];

    // Optional: filter out inactive if not complexId specified, 
    // but usually we want isActive check unless authorized.
    // For public detail pages, definitely want isActive.
    constraints.push(where('isActive', '==', true));

    if (filters?.city) {
      constraints.push(where('city', '==', filters.city));
    }

    if (filters?.type) {
      constraints.push(where('type', '==', filters.type));
    }

    if (filters?.complexId) {
      constraints.push(where('complexId', '==', filters.complexId));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(collection(db, 'terrains'), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const terrainList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Terrain));
        setTerrains(terrainList);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching terrains:", err);
        setError(err as Error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters?.city, filters?.type, filters?.complexId]);

  return { terrains, isLoading, error };
}
