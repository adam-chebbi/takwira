import * as React from 'react';
import { useBlogPosts } from '@/src/hooks/useBlogPosts';
import { BlogPostCard } from '@/src/components/blog/BlogPostCard';
import { AdSlot } from '@/src/components/ads/AdSlot';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Loader2, FileText, Search } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const CATEGORIES = [
  { label: "Tous", value: "" },
  { label: "Actualités", value: "News" },
  { label: "Conseils", value: "Tips" },
  { label: "Terrains", value: "Event" },
  { label: "Interviews", value: "Academy" },
  { label: "Communauté", value: "Community" }
];

export default function BlogList() {
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const { posts, isLoading, hasMore, loadMore } = useBlogPosts(selectedCategory || undefined);

  const SkeletonCard = () => (
    <div className="bg-background-card border border-border-subtle rounded-[24px] overflow-hidden p-6 space-y-4 animate-pulse">
      <div className="aspect-[16/9] bg-background-secondary rounded-xl" />
      <div className="h-8 bg-background-secondary rounded-lg w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-background-secondary rounded w-full" />
        <div className="h-4 bg-background-secondary rounded w-5/6" />
      </div>
    </div>
  );

  return (
    <div className="flex-grow bg-background-primary pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/20 text-accent-green text-[10px] font-black uppercase tracking-[0.2em] mb-4"
          >
            Le Mag Takwira
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-display font-black uppercase leading-[0.85] tracking-tighter text-text-primary"
          >
            Actualités <br />
            <span className="text-accent-green">Foot Amateur</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary text-lg md:text-xl font-medium max-w-2xl mx-auto uppercase tracking-wide"
          >
            Découvre les meilleurs conseils, terrains et interviews.
          </motion.p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                "h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                selectedCategory === cat.value
                  ? "bg-accent-green text-black border-accent-green shadow-[0_10px_20px_rgba(34,197,94,0.3)] scale-105"
                  : "bg-background-card text-text-tertiary hover:text-text-primary border-border-subtle hover:border-text-tertiary"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Grid */}
        {isLoading && posts.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            <AnimatePresence mode="popLayout">
              {posts.map((post, index) => (
                <React.Fragment key={post.id}>
                  <BlogPostCard post={post} />
                  {index === 5 && (
                    <div className="col-span-full py-12">
                      <AdSlot position="blog_list_between" className="bg-background-card rounded-[32px] border border-border-subtle p-8" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 space-y-8 bg-background-card rounded-[48px] border border-border-subtle"
          >
            <div className="w-24 h-24 bg-background-secondary rounded-full flex items-center justify-center text-text-tertiary mx-auto shadow-inner">
              <FileText size={48} />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-display font-black uppercase tracking-tight text-text-primary">Aucun article pour l'instant</h3>
              <p className="text-text-secondary text-sm max-w-sm mx-auto">Revenez bientôt pour du contenu sur le football tunisien.</p>
            </div>
            <Button 
                variant="outline" 
                onClick={() => setSelectedCategory("")}
                className="h-12 px-8 uppercase font-bold text-[10px] tracking-widest border-accent-green/30 text-accent-green"
            >
                Voir tous les articles
            </Button>
          </motion.div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="mt-20 text-center">
            <Button 
              onClick={loadMore}
              disabled={isLoading}
              variant="outline" 
              className="h-16 px-12 border-2 border-border-subtle text-text-primary text-[11px] font-black uppercase tracking-widest hover:border-accent-green hover:text-accent-green group transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Charger plus d'articles"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

