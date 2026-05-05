import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { BlogPost } from '@/src/lib/schema';

export function useBlogPost(identifier: string | undefined, onlyPublished = true) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPost() {
      if (!identifier) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Try ID first
        const docRef = doc(db, 'blogPosts', identifier);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as BlogPost;
          if (!onlyPublished || data.status === 'published') {
            setPost({ id: docSnap.id, ...data });
            setIsLoading(false);
            return;
          }
        }

        // Try Slug
        const constraints = [
          where('slug', '==', identifier),
          limit(1)
        ];
        if (onlyPublished) {
          constraints.push(where('status', '==', 'published'));
        }

        const q = query(collection(db, 'blogPosts'), ...constraints as any);
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setPost({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BlogPost);
        } else {
          setPost(null);
        }
      } catch (err) {
        console.error("Error fetching blog post:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPost();
  }, [identifier, onlyPublished]);

  return { post, loading: isLoading, error };
}

export function useRelatedPosts(category: string, currentPostId: string) {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    async function fetchRelated() {
      if (!category) return;

      try {
        const q = query(
          collection(db, 'blogPosts'),
          where('status', '==', 'published'),
          where('category', '==', category),
          orderBy('publishedAt', 'desc'),
          limit(4)
        );

        const snapshot = await getDocs(q);
        const related = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as BlogPost))
          .filter(p => p.id !== currentPostId)
          .slice(0, 3);

        setPosts(related);
      } catch (err) {
        console.error("Error fetching related posts:", err);
      }
    }

    fetchRelated();
  }, [category, currentPostId]);

  return posts;
}
