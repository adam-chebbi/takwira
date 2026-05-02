import * as React from 'react';
import { collection, query, where, orderBy, onSnapshot, getDocs, limit } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Match, MatchPlayer, MatchMessage } from '@/src/lib/schema';

export const useMatch = (linkToken: string | undefined) => {
  const [match, setMatch] = React.useState<Match | null>(null);
  const [players, setPlayers] = React.useState<MatchPlayer[]>([]);
  const [messages, setMessages] = React.useState<MatchMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!linkToken) return;

    const fetchMatch = async () => {
      try {
        const q = query(collection(db, 'matches'), where('linkToken', '==', linkToken), limit(1));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setError(new Error("Match not found"));
          setIsLoading(false);
          return;
        }

        const matchDoc = snapshot.docs[0];
        const matchId = matchDoc.id;
        const matchData = { id: matchId, ...matchDoc.data() } as Match;
        setMatch(matchData);

        // Listen to Match Players
        const playersUnsubscribe = onSnapshot(
          query(collection(db, 'matchPlayers'), where('matchId', '==', matchId)),
          (snap) => {
            setPlayers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MatchPlayer)));
          }
        );

        // Listen to Match Messages
        const messagesUnsubscribe = onSnapshot(
          query(collection(db, 'matchMessages'), where('matchId', '==', matchId), orderBy('createdAt', 'asc')),
          (snap) => {
            setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MatchMessage)));
          }
        );

        setIsLoading(false);

        return () => {
          playersUnsubscribe();
          messagesUnsubscribe();
        };
      } catch (err) {
        console.error("Error in useMatch:", err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    fetchMatch();
  }, [linkToken]);

  return { match, players, messages, isLoading, error };
};
