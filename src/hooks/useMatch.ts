import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Match, MatchPlayer, MatchMessage } from '@/src/lib/schema';

export function useMatch(linkToken: string | undefined) {
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<MatchPlayer[]>([]);
  const [messages, setMessages] = useState<MatchMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!linkToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let unsubscribePlayers: (() => void) | null = null;
    let unsubscribeMessages: (() => void) | null = null;

    const matchQuery = query(
      collection(db, 'matches'),
      where('linkToken', '==', linkToken),
      limit(1)
    );

    const unsubscribeMatch = onSnapshot(
      matchQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const matchDoc = snapshot.docs[0];
          const matchData = { id: matchDoc.id, ...matchDoc.data() } as Match;
          setMatch(matchData);

          // Clean up existing inner listeners if match document updates
          if (unsubscribePlayers) unsubscribePlayers();
          if (unsubscribeMessages) unsubscribeMessages();

          // Setup Players Listener
          const playersQuery = query(
            collection(db, 'matchPlayers'),
            where('matchId', '==', matchDoc.id)
          );
          unsubscribePlayers = onSnapshot(playersQuery, (pSnapshot) => {
            const playerList = pSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as MatchPlayer));
            setPlayers(playerList);
          });

          // Setup Messages Listener
          const messagesQuery = query(
            collection(db, 'matchMessages'),
            where('matchId', '==', matchDoc.id),
            orderBy('createdAt', 'asc'),
            limit(100)
          );
          unsubscribeMessages = onSnapshot(messagesQuery, (mSnapshot) => {
            const messageList = mSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as MatchMessage));
            setMessages(messageList);
          });

          setIsLoading(false);
        } else {
          setMatch(null);
          setPlayers([]);
          setMessages([]);
          setIsLoading(false);
        }
      },
      (err) => {
        console.error("Error fetching match:", err);
        setError(err as Error);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribeMatch();
      if (unsubscribePlayers) unsubscribePlayers();
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [linkToken]);

  const joinMatch = async (playerName: string, playerPhone?: string, userId?: string) => {
    if (!match) return;
    try {
      await addDoc(collection(db, 'matchPlayers'), {
        matchId: match.id,
        playerName,
        playerPhone: playerPhone || null,
        userId: userId || null,
        status: 'confirmed',
        joinedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error joining match:", err);
      throw err;
    }
  };

  const sendMessage = async (text: string, senderId: string, senderName: string, avatarColor: string) => {
    if (!match) return;
    try {
      await addDoc(collection(db, 'matchMessages'), {
        matchId: match.id,
        senderId,
        senderName,
        senderAvatarColor: avatarColor,
        text,
        createdAt: serverTimestamp(),
        isDeleted: false
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return { match, players, messages, isLoading, error, joinMatch, sendMessage };
}
