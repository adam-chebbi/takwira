import * as React from 'react';
import { useBlog } from '@/src/hooks/useBlog';
import { BlogPostCard } from '@/src/components/blog/BlogPostCard';
import { AdBanner } from '@/src/components/blog/AdBanner';
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
            className="text-[clamp(48px,10vw,120px)] font-display font-black uppercase leading-[0.85] tracking-tighter"
          >
            <span className="text-white">Le Blog</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-white">Takwira</span>
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
                "h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                selectedCategory === cat
                  ? "bg-accent-green text-black scale-105 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                  : "bg-background-card text-text-tertiary hover:text-white border border-border-subtle"
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
                {index === 5 && (
                  <div className="col-span-full py-8">
                    <AdBanner position="blog_list_between" className="h-[200px] md:h-[300px]" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </AnimatePresence>
        </div>

        {/* Loading State / Load More */}
        {loading && posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 size={48} className="text-accent-green animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Chargement du terrain...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-32 space-y-6">
            <div className="w-20 h-20 bg-background-card border border-border-subtle rounded-3xl flex items-center justify-center text-text-tertiary mx-auto opacity-20">
              <Search size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-display font-black uppercase tracking-tight text-white">Aucun article trouvé</h3>
              <p className="text-text-secondary text-sm">Essaie de changer de catégorie ou reviens plus tard.</p>
            </div>
          </div>
        ) : null}

        {hasMore && !loading && (
          <div className="mt-20 text-center">
            <Button 
              onClick={loadMore}
              variant="outline" 
              className="h-14 px-12 border-border-subtle text-[11px] font-black uppercase tracking-widest hover:border-accent-green group"
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
