import * as React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBlogPost } from '@/src/hooks/useBlogPost';
import { useBlogPosts } from '@/src/hooks/useBlogPosts';
import { AdSlot } from '@/src/components/ads/AdSlot';
import { BlogPostCard } from '@/src/components/blog/BlogPostCard';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, Calendar, Clock, Share2, MessageCircle, Link as LinkIcon, ArrowLeft, ChevronRight, FileText } from 'lucide-react';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import DOMPurify from 'dompurify';
import { updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useCookie } from '@/src/contexts/CookieContext';
import { useToast } from '@/src/components/ui/Toast';

export default function BlogPostDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { post, loading, error } = useBlogPost(slug || '');
  const { posts: recentPosts } = useBlogPosts(undefined, 4);
  const { canTrackAnalytics } = useCookie();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!loading && !post) {
      toast("Article introuvable.", 'error');
      navigate('/blog');
    }
  }, [loading, post, navigate, toast]);

  React.useEffect(() => {
    if (post && canTrackAnalytics) {
      const trackView = async () => {
        try {
          await updateDoc(doc(db, 'blogPosts', post.id), {
            viewCount: increment(1)
          });
        } catch (e) {
          console.error("Error incrementing view count:", e);
        }
      };
      trackView();
    }
  }, [post?.id, canTrackAnalytics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center pt-20">
        <Loader2 className="w-12 h-12 text-accent-green animate-spin" />
        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Chargement de l'article...</p>
      </div>
    );
  }

  if (!post) return null;

  const publishedDate = post.publishedAt?.toDate() || new Date();

  const handleShareWhatsApp = () => {
    const url = window.location.href;
    const text = `Découvre cet article sur Takwira: ${post.title} ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast("Lien copié !", 'success');
  };

  const renderContentWithAds = (html: string) => {
    const sanitized = DOMPurify.sanitize(html);
    const paragraphs = sanitized.split('</p>')
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => p + '</p>');
    
    return paragraphs.map((p, index) => {
      const key = `p-${index}`;
      const shouldInjectAfter = (index + 1) % 3 === 0 && index !== paragraphs.length - 1;

      return (
        <React.Fragment key={key}>
          <div dangerouslySetInnerHTML={{ __html: p }} />
          {shouldInjectAfter && (
            <div className="my-16 py-8 border-y border-border-subtle bg-background-secondary/50 rounded-3xl">
              <AdSlot position="blog_post_inline" />
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="flex-grow bg-background-primary pb-32">
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-accent-green transition-colors group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Retour au blog
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-16">
          <article className="flex-1 min-w-0">
            <div className="aspect-video md:aspect-[21/9] rounded-[40px] overflow-hidden border border-border-subtle mb-12 shadow-2xl relative">
              <img 
                src={post.coverImageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <Badge className="bg-accent-green text-black font-black uppercase mb-4 h-8 px-4 border-none shadow-lg shadow-accent-green/20">
                  {post.category}
                </Badge>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-black uppercase text-white leading-none tracking-tight">
                  {post.title}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between py-8 border-y border-border-subtle mb-12 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-background-card border border-border-subtle overflow-hidden flex items-center justify-center shadow-sm">
                  {post.authorAvatarUrl ? (
                    <img src={post.authorAvatarUrl} className="w-full h-full object-cover" alt={post.authorName} />
                  ) : (
                    <div className="w-full h-full bg-accent-green text-black font-black text-xl flex items-center justify-center">
                      {post.authorName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-text-primary">{post.authorName}</p>
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                    <span>{format(publishedDate, 'dd MMMM yyyy', { locale: fr })}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {post.readTimeMinutes} min</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                 <Button variant="outline" size="sm" onClick={handleCopyLink} className="h-11 rounded-xl border-border-subtle text-[10px] font-black uppercase tracking-widest hover:bg-background-secondary">
                   <LinkIcon size={14} className="mr-2" /> Copier
                 </Button>
                 <Button size="sm" onClick={handleShareWhatsApp} className="h-11 px-6 rounded-xl bg-[#25D366] text-white hover:bg-[#128C7E] text-[10px] font-black uppercase tracking-widest border-none shadow-lg shadow-green-500/20">
                   <MessageCircle size={16} className="mr-2" /> WhatsApp
                 </Button>
              </div>
            </div>

            <div className="blog-content mb-24 text-text-primary">
              {renderContentWithAds(post.content)}
            </div>

            <div className="p-12 bg-background-card rounded-[40px] border border-border-subtle text-center space-y-8 shadow-xl">
               <div className="space-y-2">
                 <h3 className="text-2xl font-display font-black uppercase tracking-tight">Tu as aimé cet article ?</h3>
                 <p className="text-text-secondary text-sm">Partage l'actualité du foot avec tes amis sur WhatsApp !</p>
               </div>
               <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <Button onClick={handleShareWhatsApp} className="h-16 px-10 rounded-2xl bg-[#25D366] text-white hover:bg-[#128C7E] font-black uppercase tracking-widest border-none text-xs w-full md:w-auto shadow-xl shadow-green-500/30">
                    Partager sur WhatsApp
                  </Button>
                  <Button variant="outline" onClick={handleCopyLink} className="h-16 px-10 rounded-2xl border-border-subtle text-text-primary font-black uppercase tracking-widest text-xs w-full md:w-auto">
                    Copier le lien
                  </Button>
               </div>
            </div>
          </article>

          <aside className="hidden lg:block w-[380px] shrink-0">
            <div className="sticky top-24 space-y-12">
              <div className="p-1 bg-background-card border border-border-subtle rounded-3xl overflow-hidden shadow-xl">
                <AdSlot position="blog_sidebar_top" className="min-h-[250px]" />
              </div>
              
              <div className="space-y-8">
                <div className="flex items-center gap-4 px-2">
                  <div className="h-1 flex-1 bg-accent-green rounded-full" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">À lire aussi</h3>
                  <div className="h-1 w-12 bg-border-subtle rounded-full" />
                </div>
                <div className="space-y-4">
                  {recentPosts.filter(p => p.id !== post.id).slice(0, 4).map(p => (
                    <Link key={p.id} to={`/blog/${p.slug}`} className="group flex gap-4 p-4 rounded-2xl bg-background-card border border-border-subtle hover:border-accent-green hover:shadow-lg transition-all">
                      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 shadow-sm">
                        <img src={p.coverImageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={p.title} />
                      </div>
                      <div className="flex flex-col py-1">
                        <h4 className="text-xs font-black text-text-primary line-clamp-2 leading-tight mb-2 group-hover:text-accent-green transition-colors">
                          {p.title}
                        </h4>
                        <div className="mt-auto flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text-tertiary">
                          <Calendar size={10} className="text-accent-green" />
                          {format(p.publishedAt?.toDate() || new Date(), 'dd MMM', { locale: fr })}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="p-1 bg-background-card border border-border-subtle rounded-3xl overflow-hidden shadow-xl">
                <AdSlot position="blog_sidebar_bottom" className="min-h-[250px]" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
