import * as React from 'react';
import { useBlog } from '@/src/hooks/useBlog';
import { BlogPostCard } from '@/src/components/blog/BlogPostCard';
import { AdSlot } from '@/src/components/ads/AdSlot';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Loader2, Search } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const CATEGORIES = ["Tous", "Actualités", "Conseils", "Terrains", "Interviews", "Communauté"];

export default function BlogList() {
  const [selectedCategory, setSelectedCategory] = React.useState("Tous");
  const { posts, loading, hasMore, loadMore } = useBlog({ 
    category: selectedCategory === "Tous" ? undefined : selectedCategory,
    pageSize: 9
  });

  return (
    <div className="min-h-screen bg-background-primary pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[clamp(48px,10vw,120px)] font-display font-extrabold uppercase leading-[0.85] tracking-tighter"
          >
            <span className="text-pl-purple uppercase">LE BLOG</span> <br />
            <span className="text-pl-purple uppercase">TAKWIRA</span>
            <span className="text-pl-pink">.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary text-lg md:text-xl font-medium max-w-2xl mx-auto"
          >
            Actualités, conseils et vie du football amateur en Tunisie.
          </motion.p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "h-10 px-6 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border",
                selectedCategory === cat
                  ? "bg-pl-purple text-white border-pl-purple shadow-pl"
                  : "bg-white text-text-muted hover:text-pl-purple border-border-subtle"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          <AnimatePresence mode="popLayout">
            {posts.map((post, index) => (
              <React.Fragment key={post.id}>
                <BlogPostCard post={post} />
                {index === 2 && (
                  <div className="col-span-full py-8">
                    <AdSlot position="blog_list_between" className="h-[90px]" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </AnimatePresence>
        </div>

        {/* Loading State / Load More */}
        {loading && posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 size={48} className="text-pl-purple animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Chargement du terrain...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-32 space-y-6">
            <div className="w-20 h-20 bg-white border border-border-subtle rounded-3xl flex items-center justify-center text-text-muted mx-auto opacity-20 shadow-sm">
              <Search size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-display font-extrabold uppercase tracking-tight text-pl-purple">Aucun article trouvé</h3>
              <p className="text-text-secondary text-sm">Essaie de changer de catégorie ou reviens plus tard.</p>
            </div>
          </div>
        ) : null}

        {hasMore && !loading && (
          <div className="mt-20 text-center">
            <Button 
              onClick={loadMore}
              variant="outline" 
              className="h-14 px-12 border-pl-purple text-pl-purple text-[11px] font-bold uppercase tracking-widest hover:bg-pl-purple hover:text-white group"
            >
              Charger plus d'articles
              <Loader2 className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
