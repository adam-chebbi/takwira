import * as React from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Academy } from '@/src/lib/schema';

export const useManagerAcademies = (managerId: string | undefined) => {
  const [academies, setAcademies] = React.useState<(Academy & { memberCount: number })[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!managerId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, 'academies'), where('managerId', '==', managerId));
        const snapshot = await getDocs(q);
        
        const academiesData = await Promise.all(snapshot.docs.map(async (doc) => {
          const academy = { id: doc.id, ...doc.data() } as Academy;
          
          // Get member count (simplified, could also be a field in the doc)
          const membersQ = query(collection(db, 'academyMembers'), where('academyId', '==', doc.id));
          const membersSnap = await getDocs(membersQ);
          
          return { ...academy, memberCount: membersSnap.size };
        }));

        setAcademies(academiesData);
      } catch (err) {
        console.error("Error fetching academies:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [managerId]);

  return { academies, isLoading };
};
