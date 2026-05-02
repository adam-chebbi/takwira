import * as React from 'react';
import { collection, query, where, orderBy, onSnapshot, QueryConstraint } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Reservation } from '@/src/lib/schema';

interface ReservationFilters {
  terrainId?: string;
  managerId?: string;
  organizerId?: string;
  date?: string;
}

export const useReservations = (filters: ReservationFilters) => {
  const [reservations, setReservations] = React.useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const constraints: QueryConstraint[] = [];
    
    if (filters.terrainId) constraints.push(where('terrainId', '==', filters.terrainId));
    if (filters.managerId) constraints.push(where('managerId', '==', filters.managerId));
    if (filters.organizerId) constraints.push(where('organizerId', '==', filters.organizerId));
    if (filters.date) constraints.push(where('date', '==', filters.date));
    
    constraints.push(orderBy('startTime', 'asc'));

    const q = query(collection(db, 'reservations'), ...constraints);
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setReservations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation)));
        setIsLoading(false);
      },
      (err) => {
        console.error("Error listening to reservations:", err);
        setError(err as Error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters.terrainId, filters.managerId, filters.organizerId, filters.date]);

  return { reservations, isLoading, error };
};
