import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  startAfter, 
  QueryDocumentSnapshot, 
  onSnapshot,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { BlogPost, AdSlot } from '@/src/lib/schema';

export function useBlog(options: { 
  category?: string; 
  status?: string; 
  pageSize?: number;
} = {}) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);

  const fetchPosts = useCallback(async (isInitial = true) => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'blogPosts'),
        orderBy('publishedAt', 'desc'),
        limit(options.pageSize || 9)
      );

      if (options.category && options.category !== 'Tous') {
        q = query(q, where('category', '==', options.category));
      }

      if (options.status) {
        q = query(q, where('status', '==', options.status));
      } else {
        q = query(q, where('status', '==', 'published'));
      }

      if (!isInitial && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
      
      if (isInitial) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === (options.pageSize || 9));
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [options.category, options.status, options.pageSize, lastDoc]);

  useEffect(() => {
    fetchPosts(true);
  }, [options.category, options.status]);

  return { posts, loading, hasMore, loadMore: () => fetchPosts(false) };
}
