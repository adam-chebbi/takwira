import * as React from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  orderBy,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Terrain } from '@/src/lib/schema';

interface Filters {
  city?: string;
  type?: '6v6' | '7v7';
  limitCount?: number;
}

export const useTerrains = (filters?: Filters) => {
  const [terrains, setTerrains] = React.useState<Terrain[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchTerrains = async () => {
      setIsLoading(true);
      try {
        const constraints: QueryConstraint[] = [where('isActive', '==', true)];
        
        if (filters?.city) {
          constraints.push(where('city', '==', filters.city));
        }
        
        if (filters?.type) {
          constraints.push(where('type', '==', filters.type));
        }

        constraints.push(orderBy('createdAt', 'desc'));

        if (filters?.limitCount) {
          constraints.push(limit(filters.limitCount));
        }

        const q = query(collection(db, 'terrains'), ...constraints);
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Terrain));
        setTerrains(data);
      } catch (err) {
        console.error("Error fetching terrains:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerrains();
  }, [filters?.city, filters?.type, filters?.limitCount]);

  return { terrains, isLoading, error };
};
