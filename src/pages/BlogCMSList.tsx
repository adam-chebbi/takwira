import * as React from 'react';
import { useBlog } from '@/src/hooks/useBlog';
import { BlogPost } from '@/src/lib/schema';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  where
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Calendar, 
  MoreHorizontal, 
  Search,
  CheckCircle,
  XCircle,
  Archive,
  EyeOff,
  BarChart3,
  FileText
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/src/lib/utils';

export default function BlogCMSList() {
  const [selectedStatus, setSelectedStatus] = React.useState('Tous');
  const { posts, loading } = useBlog({ 
    status: selectedStatus === 'Tous' ? undefined : selectedStatus.toLowerCase() as any,
    pageSize: 50 
  });
  const navigate = useNavigate();

  const [stats, setStats] = React.useState({
    total: 0,
    published: 0,
    drafts: 0,
    totalViews: 0
  });

  React.useEffect(() => {
    async function fetchStats() {
      const q = query(collection(db, 'blogPosts'));
      const snapshot = await getDocs(q);
      const allPosts = snapshot.docs.map(d => d.data() as BlogPost);
      
      setStats({
        total: allPosts.length,
        published: allPosts.filter(p => p.status === 'published').length,
        drafts: allPosts.filter(p => p.status === 'draft').length,
        totalViews: allPosts.reduce((acc, p) => acc + (p.viewCount || 0), 0)
      });
    }
    fetchStats();
  }, []);

  const handleDelete = async (postId: string) => {
    if (window.confirm("Es-tu sûr de vouloir supprimer cet article ? Cette action est irréversible.")) {
      try {
        await deleteDoc(doc(db, 'blogPosts', postId));
        // Refresh would be better but let's just let the hook handle it if it was real-time
        window.location.reload();
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await updateDoc(doc(db, 'blogPosts', post.id), {
        status: newStatus,
        updatedAt: new Date()
      });
      window.location.reload();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background-primary pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight text-white leading-none">
              Gestion du Blog
            </h1>
            <p className="text-text-secondary text-sm font-medium">Administre tes articles et analyse les performances.</p>
          </div>
          
          <Link to="/admin/blog/nouveau">
            <Button className="h-14 px-8 rounded-2xl bg-accent-green text-black font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_8px_30px_rgba(34,197,94,0.3)]">
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
              className="p-6 bg-background-card border border-border-subtle rounded-3xl"
            >
              <div className={cn("w-10 h-10 rounded-xl bg-background-secondary flex items-center justify-center mb-4", stat.color)}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-display font-black text-white">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs & Filters */}
        <div className="flex items-center justify-between gap-4 mb-8">
           <div className="flex items-center gap-2 bg-background-card p-1.5 rounded-2xl border border-border-subtle overflow-x-auto no-scrollbar">
              {['Tous', 'Publiés', 'Draft', 'Archivés'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={cn(
                    "h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                    selectedStatus === status 
                      ? "bg-background-secondary text-white shadow-sm" 
                      : "text-text-tertiary hover:text-white"
                  )}
                >
                  {status === 'Draft' ? 'Brouillons' : status}
                </button>
              ))}
           </div>
        </div>

        {/* Post List */}
        <div className="bg-background-card border border-border-subtle rounded-[32px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background-secondary/50 border-b border-border-subtle">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Article</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Catégorie</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Statut</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Stats</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Date</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-tertiary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-8 py-10">
                        <div className="h-4 bg-background-secondary rounded w-3/4"></div>
                      </td>
                    </tr>
                  ))
                ) : posts.length === 0 ? (
                   <tr>
                     <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="space-y-4 opacity-20">
                          <FileText size={48} className="mx-auto" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Aucun article trouvé</p>
                        </div>
                     </td>
                   </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="group hover:bg-background-secondary/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl border border-border-subtle overflow-hidden bg-background-secondary bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${post.coverImageUrl})` }} />
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-white group-hover:text-accent-green transition-colors line-clamp-1">{post.title}</p>
                            <p className="text-[10px] text-text-tertiary font-mono">/{post.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant="outline" className="text-[9px] font-black uppercase border-border-subtle text-text-tertiary">{post.category}</Badge>
                      </td>
                      <td className="px-8 py-6">
                        <Badge className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-3 h-6",
                          post.status === 'published' ? "bg-accent-green/10 text-accent-green border-accent-green/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        )}>
                          {post.status === 'published' ? 'En ligne' : 'Brouillon'}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs font-mono text-text-secondary">
                          <Eye size={12} className="text-text-tertiary" /> {post.viewCount || 0}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-xs font-mono text-text-tertiary">
                           {post.publishedAt ? format(post.publishedAt.toDate(), 'dd/MM/yy') : '-'}
                         </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2">
                           <Link to={`/admin/blog/${post.id}/modifier`}>
                             <button className="w-10 h-10 rounded-xl bg-background-secondary border border-border-subtle flex items-center justify-center text-text-tertiary hover:text-white hover:border-white transition-all">
                               <Edit2 size={16} />
                             </button>
                           </Link>
                           <button 
                             onClick={() => handleToggleStatus(post)}
                             className="w-10 h-10 rounded-xl bg-background-secondary border border-border-subtle flex items-center justify-center text-text-tertiary hover:text-accent-green hover:border-accent-green transition-all"
                           >
                             {post.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
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
