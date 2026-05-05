import * as React from 'react';
import { BlogPost } from '@/src/lib/schema';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Search,
  CheckCircle,
  Archive,
  BarChart3,
  FileText,
  Loader2,
  EyeOff
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/src/lib/utils';
import { useToast } from '@/src/components/ui/Toast';

export default function BlogCMSList() {
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedStatus, setSelectedStatus] = React.useState('Tous');
  const { toast } = useToast();

  const fetchPosts = React.useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'blogPosts'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
      setPosts(allPosts);
    } catch (error) {
      console.error("Error fetching admin posts:", error);
      toast("Erreur lors du chargement des articles.", 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = posts.filter(post => {
    if (selectedStatus === 'Tous') return true;
    if (selectedStatus === 'Publiés') return post.status === 'published';
    if (selectedStatus === 'Brouillons') return post.status === 'draft';
    if (selectedStatus === 'Archivés') return post.status === 'archived';
    return true;
  });

  const handleDelete = async (postId: string) => {
    if (window.confirm("Es-tu sûr de vouloir supprimer cet article ? Cette action est irréversible.")) {
      try {
        await deleteDoc(doc(db, 'blogPosts', postId));
        setPosts(prev => prev.filter(p => p.id !== postId));
        toast("Article supprimé.", 'success');
      } catch (error) {
        console.error("Error deleting post:", error);
        toast("Erreur lors de la suppression.", 'error');
      }
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    const isPublishing = post.status !== 'published';
    const newStatus = isPublishing ? 'published' : 'draft';
    
    try {
      const updateData: any = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };
      
      if (isPublishing && !post.publishedAt) {
        updateData.publishedAt = serverTimestamp();
      }

      await updateDoc(doc(db, 'blogPosts', post.id), updateData);
      
      setPosts(prev => prev.map(p => 
        p.id === post.id 
          ? { ...p, status: newStatus, publishedAt: isPublishing ? (p.publishedAt || new Date() as any) : p.publishedAt } 
          : p
      ));
      
      toast(isPublishing ? "Article publié !" : "Article passé en brouillon.", 'success');
    } catch (error) {
      console.error("Error updating status:", error);
      toast("Erreur lors de la mise à jour.", 'error');
    }
  };

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    drafts: posts.filter(p => p.status === 'draft').length,
    totalViews: posts.reduce((acc, p) => acc + (p.viewCount || 0), 0)
  };

  return (
    <div className="min-h-screen bg-background-primary pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight text-text-primary leading-none">
              Blog CMS
            </h1>
            <p className="text-text-secondary text-sm font-medium uppercase tracking-widest">Gère tes publications et analyses</p>
          </div>
          
          <Link to="/admin/blog/nouveau">
            <Button className="h-14 px-8 rounded-2xl bg-accent-green text-black font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-accent-green/20">
              <Plus size={20} className="mr-2" /> Nouvel article
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Articles", value: stats.total, icon: FileText, color: "text-blue-500" },
            { label: "Publiés", value: stats.published, icon: CheckCircle, color: "text-accent-green" },
            { label: "Brouillons", value: stats.drafts, icon: Archive, color: "text-amber-500" },
            { label: "Vues Totales", value: stats.totalViews.toLocaleString(), icon: BarChart3, color: "text-purple-500" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-background-card border border-border-subtle rounded-3xl shadow-sm"
            >
              <div className={cn("w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center mb-4", stat.color)}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-display font-black text-text-primary">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs & Filters */}
        <div className="flex items-center gap-2 bg-background-card p-1.5 rounded-2xl border border-border-subtle mb-8 overflow-x-auto no-scrollbar">
           {['Tous', 'Publiés', 'Brouillons', 'Archivés'].map((status) => (
             <button
               key={status}
               onClick={() => setSelectedStatus(status)}
               className={cn(
                 "h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                 selectedStatus === status 
                   ? "bg-accent-green text-black shadow-sm" 
                   : "text-text-tertiary hover:text-text-primary"
               )}
             >
               {status}
             </button>
           ))}
        </div>

        {/* Post List */}
        <div className="bg-background-card border border-border-subtle rounded-[32px] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background-secondary/30 border-b border-border-subtle">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Article</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Catégorie</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Statut</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Stats</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Publié le</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-8 py-10">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 bg-background-secondary rounded-xl" />
                          <div className="h-4 bg-background-secondary rounded w-1/2" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredPosts.length === 0 ? (
                   <tr>
                     <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="space-y-4 opacity-50">
                          <FileText size={48} className="mx-auto text-text-tertiary" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Aucun article trouvé</p>
                        </div>
                     </td>
                   </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <tr key={post.id} className="group hover:bg-background-secondary/20 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl border border-border-subtle overflow-hidden bg-background-secondary shrink-0">
                            <img src={post.coverImageUrl} className="w-full h-full object-cover" alt={post.title} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-black text-text-primary group-hover:text-accent-green transition-colors line-clamp-1">{post.title}</p>
                            <p className="text-[10px] text-text-tertiary font-bold tracking-tight">/{post.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant="outline" className="text-[9px] font-black uppercase border-border-subtle text-text-tertiary">{post.category}</Badge>
                      </td>
                      <td className="px-8 py-6">
                        <Badge className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-3 h-6 border-none",
                          post.status === 'published' ? "bg-accent-green/10 text-accent-green" : "bg-amber-500/10 text-amber-500"
                        )}>
                          {post.status === 'published' ? 'En ligne' : 'Brouillon'}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs font-black text-text-secondary">
                          <Eye size={12} className="text-accent-green" /> {post.viewCount || 0}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-xs font-bold text-text-tertiary uppercase">
                           {post.publishedAt ? format(post.publishedAt.toDate(), 'dd MMM yyyy', { locale: fr }) : '-'}
                         </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2">
                           <Link to={`/admin/blog/${post.id}/modifier`}>
                             <button className="w-10 h-10 rounded-xl bg-background-secondary border border-border-subtle flex items-center justify-center text-text-tertiary hover:text-text-primary hover:border-text-primary transition-all">
                               <Edit2 size={16} />
                             </button>
                           </Link>
                           <button 
                             onClick={() => handleToggleStatus(post)}
                             className={cn(
                               "w-10 h-10 rounded-xl bg-background-secondary border border-border-subtle flex items-center justify-center transition-all",
                               post.status === 'published' ? "text-accent-green hover:bg-accent-green/10" : "text-text-tertiary hover:text-accent-green"
                             )}
                             title={post.status === 'published' ? "Dépublier" : "Publier"}
                           >
                             {post.status === 'published' ? <CheckCircle size={16} /> : <EyeOff size={16} />}
                           </button>
                           <button 
                             onClick={() => handleDelete(post.id)}
                             className="w-10 h-10 rounded-xl bg-background-secondary border border-border-subtle flex items-center justify-center text-text-tertiary hover:text-danger hover:border-danger transition-all"
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

