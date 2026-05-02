import * as React from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { AcademyMember } from '@/src/lib/schema';

export const useAcademyMembers = (academyId: string | undefined) => {
  const [members, setMembers] = React.useState<AcademyMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!academyId) return;

    const q = query(
      collection(db, 'academyMembers'), 
      where('academyId', '==', academyId),
      orderBy('subscriptionEnd', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AcademyMember)));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [academyId]);

  return { members, isLoading };
};
