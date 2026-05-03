import * as React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBlogPost, useRelatedPosts } from '@/src/hooks/useBlogPost';
import { AdSlot } from '@/src/components/ads/AdSlot';
import { BlogPostCard } from '@/src/components/blog/BlogPostCard';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, Calendar, Clock, Share2, MessageCircle, Link as LinkIcon, ArrowLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import DOMPurify from 'dompurify';

export default function BlogPostDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { post, loading, error } = useBlogPost(slug || '');
  const relatedPosts = useRelatedPosts(post?.category || '', post?.id || '');

  React.useEffect(() => {
    if (error) {
      // Redirect with toast would be better but let's just navigate back
      navigate('/blog');
    }
  }, [error, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center pt-20">
        <Loader2 className="w-12 h-12 text-accent-green animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-text-tertiary">Chargement de l'article...</p>
      </div>
    );
  }

  if (!post) return null;

  const publishedDate = post.publishedAt?.toDate() || new Date();

  // Content processing: Inject ads at safe points
  const renderContentWithAds = (html: string) => {
    const sanitized = DOMPurify.sanitize(html);
    // Split by paragraph but filter empty ones
    const paragraphs = sanitized.split('</p>')
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => p + '</p>');
    
    let adInjected = false;

    return paragraphs.map((p, index) => {
      const key = `p-${index}`;
      
      // Validation: Is this a safe point to inject an ad AFTER this block?
      // 1. Not the first paragraph
      // 2. Not already injected
      // 3. Current block doesn't contain restricted elements (h1-h6, blockquote, pre, etc.)
      const isFirst = index === 0;
      const hasRestricted = /<(h[1-6]|blockquote|pre|code|img|figure)/i.test(p);
      
      const shouldInjectAfter = !adInjected && index >= 2 && !hasRestricted && !isFirst;
      if (shouldInjectAfter) adInjected = true;

      return (
        <React.Fragment key={key}>
          <div dangerouslySetInnerHTML={{ __html: p }} />
          {shouldInjectAfter && (
            <div className="my-12">
              <AdSlot position="blog_post_inline" />
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  const handleShareWhatsApp = () => {
    const url = window.location.href;
    const text = `Découvre cet article sur Takwira: ${post.title} ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // Could add a toast here
  };

  return (
    <div className="min-h-screen bg-background-primary pt-24 pb-32">
      {/* Breadcrumbs & Navigation */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-accent-green transition-colors">
          <ArrowLeft size={14} /> Retour au blog
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Main Article Content */}
          <article className="flex-1 min-w-0">
            {/* Hero Image */}
            <div className="aspect-video md:aspect-[21/9] rounded-[32px] overflow-hidden border border-border-subtle mb-10">
              <img 
                src={post.coverImageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Header */}
            <div className="space-y-6 mb-12">
              <div className="flex flex-wrap items-center gap-4">
                <Badge className="bg-accent-green text-black border-none font-black text-[10px] uppercase tracking-widest h-8 px-4">
                  {post.category}
                </Badge>
                <div className="flex items-center gap-2 text-text-tertiary text-[10px] font-black uppercase tracking-widest">
                  <Clock size={14} /> {post.readTime} de lecture
                </div>
              </div>

              <h1 className="text-[clamp(32px,6vw,64px)] font-display font-black uppercase leading-[0.95] tracking-tight text-white">
                {post.title}
              </h1>

              <div className="flex items-center justify-between py-6 border-y border-border-subtle">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-background-card border border-border-subtle overflow-hidden flex items-center justify-center">
                     {post.authorAvatarUrl ? (
                        <img src={post.authorAvatarUrl} className="w-full h-full object-cover" alt={post.authorName} />
                     ) : (
                        <span className="text-sm font-black text-white">{post.authorName.charAt(0)}</span>
                     )}
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-sm font-bold text-white">{post.authorName}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                        {format(publishedDate, 'dd MMMM yyyy', { locale: fr })}
                      </p>
                   </div>
                </div>
                
                <div className="hidden sm:flex items-center gap-3">
                   <Button variant="outline" size="sm" onClick={handleCopyLink} className="rounded-xl border-border-subtle text-[10px] font-black uppercase tracking-widest">
                     <LinkIcon size={14} className="mr-2" /> Copier
                   </Button>
                   <Button size="sm" onClick={handleShareWhatsApp} className="rounded-xl bg-[#25D366] text-white hover:bg-[#128C7E] text-[10px] font-black uppercase tracking-widest border-none">
                     <MessageCircle size={14} className="mr-2" /> WhatsApp
                   </Button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div 
              className="blog-content prose prose-invert prose-p:text-text-primary prose-p:text-lg prose-p:leading-relaxed prose-headings:font-display prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-blockquote:border-accent-green prose-blockquote:bg-background-card prose-blockquote:rounded-r-2xl prose-blockquote:py-1 prose-a:text-accent-green max-w-none mb-20"
            >
              {renderContentWithAds(post.content)}
            </div>

            {/* Bottom Actions */}
            <div className="pt-12 border-t border-border-subtle flex flex-col items-center space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-text-tertiary">Partager cet article</h3>
              <div className="flex items-center gap-4">
                 <Button onClick={handleShareWhatsApp} className="h-14 px-8 rounded-2xl bg-[#25D366] text-white hover:bg-[#128C7E] font-black uppercase tracking-widest border-none text-xs">
                   Partager sur WhatsApp
                 </Button>
                 <Button variant="outline" onClick={handleCopyLink} className="h-14 px-8 rounded-2xl border-border-subtle text-text-primary font-black uppercase tracking-widest text-xs">
                   Copier le lien
                 </Button>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block w-[350px] shrink-0">
            <div className="sticky top-24 space-y-12">
              <AdSlot position="blog_sidebar_top" className="h-[250px]" />
              
              <div className="space-y-6">
                <h3 className="text-xl font-display font-black uppercase tracking-tight text-white border-l-4 border-accent-green pl-4">
                  Articles récents
                </h3>
                <div className="space-y-4">
                  {relatedPosts.map(p => (
                    <Link key={p.id} to={`/blog/${p.slug}`} className="group flex gap-4 p-4 rounded-2xl bg-background-card border border-border-subtle hover:border-accent-green/30 transition-all">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                        <img src={p.coverImageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={p.title} />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight mb-1 group-hover:text-accent-green">
                          {p.title}
                        </h4>
                        <p className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">
                          {format(p.publishedAt?.toDate() || new Date(), 'dd MMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <AdSlot position="blog_sidebar_bottom" className="h-[250px]" />
            </div>
          </aside>
        </div>

        {/* Related Posts Row */}
        <div className="mt-32 space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight text-white">
              Articles similaires
            </h2>
            <Link to="/blog" className="text-[10px] font-black uppercase tracking-widest text-accent-green flex items-center gap-1 hover:gap-2 transition-all">
              Tout voir <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedPosts.map(p => (
              <div key={p.id}>
                <BlogPostCard post={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
