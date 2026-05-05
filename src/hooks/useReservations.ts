import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, QueryConstraint, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Reservation } from '@/src/lib/schema';

interface ReservationOptions {
  terrainId?: string;
  managerId?: string;
  organizerId?: string;
  date?: string;
  status?: Reservation['status'];
}

export function useReservations(options: ReservationOptions = {}) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);

    const constraints: QueryConstraint[] = [];

    if (options.terrainId) {
      constraints.push(where('terrainId', '==', options.terrainId));
    }
    if (options.managerId) {
      constraints.push(where('managerId', '==', options.managerId));
    }
    if (options.organizerId) {
      constraints.push(where('organizerId', '==', options.organizerId));
    }
    if (options.date) {
      constraints.push(where('date', '==', options.date));
    }
    if (options.status) {
      constraints.push(where('status', '==', options.status));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(collection(db, 'reservations'), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reservationList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
        setReservations(reservationList);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching reservations:", err);
        setError(err as Error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [
    options.terrainId,
    options.managerId,
    options.organizerId,
    options.date,
    options.status
  ]);

  return { reservations, isLoading, error };
}
