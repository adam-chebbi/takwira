import { useState, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  increment,
  collection,
  query,
  where,
  limit,
  getDocs
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { BlogPost } from '@/src/lib/schema';

export function useBlogPost(slugOrId: string, isSlug = true) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
        if (isSlug) {
          const q = query(
            collection(db, 'blogPosts'),
            where('slug', '==', slugOrId),
            where('status', '==', 'published'),
            limit(1)
          );
          const snapshot = await getDocs(q);
          if (snapshot.empty) {
            setError("Post non trouvé");
            setPost(null);
          } else {
            const postData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BlogPost;
            setPost(postData);
            // Increment views
            updateDoc(doc(db, 'blogPosts', postData.id), {
              viewCount: increment(1)
            });
          }
        } else {
          const docRef = doc(db, 'blogPosts', slugOrId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setPost({ id: docSnap.id, ...docSnap.data() } as BlogPost);
          } else {
            setError("Post non trouvé");
          }
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Erreur lors de la récupération de l'article");
      } finally {
        setLoading(false);
      }
    }

    if (slugOrId) fetchPost();
  }, [slugOrId, isSlug]);

  return { post, loading, error };
}

export function useRelatedPosts(category: string, currentPostId: string) {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    async function fetchRelated() {
      const q = query(
        collection(db, 'blogPosts'),
        where('category', '==', category),
        where('status', '==', 'published'),
        limit(4)
      );
      const snapshot = await getDocs(q);
      setPosts(
        snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as BlogPost))
          .filter(p => p.id !== currentPostId)
          .slice(0, 3)
      );
    }
    if (category) fetchRelated();
  }, [category, currentPostId]);

  return posts;
}
