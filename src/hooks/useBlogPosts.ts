import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, limit as firestoreLimit, startAfter, QueryDocumentSnapshot, QueryConstraint } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { BlogPost } from '@/src/lib/schema';

export function useBlogPosts(category?: string, initialLimit: number = 9) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (isNextPage = false) => {
    setIsLoading(true);
    try {
      const constraints: QueryConstraint[] = [
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
        firestoreLimit(initialLimit)
      ];

      if (category) {
        constraints.unshift(where('category', '==', category));
      }

      if (isNextPage && lastVisible) {
        constraints.push(startAfter(lastVisible));
      }

      const q = query(collection(db, 'blogPosts'), ...constraints);
      const snapshot = await getDocs(q);
      
      const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
      
      if (isNextPage) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === initialLimit);
    } catch (err) {
      console.error("Error fetching blog posts:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [category, initialLimit, lastVisible]);

  useEffect(() => {
    fetchPosts();
  }, [category, initialLimit]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchPosts(true);
    }
  };

  return { posts, isLoading, error, hasMore, loadMore };
}
