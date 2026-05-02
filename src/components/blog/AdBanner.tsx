import * as React from 'react';
import { useAdSlot } from '@/src/hooks/useBlog';
import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface AdBannerProps {
  position: 'blog_list_between' | 'blog_post_inline' | 'blog_sidebar_top' | 'blog_sidebar_bottom';
  className?: string;
}

export function AdBanner({ position, className }: AdBannerProps) {
  const { ad, trackImpression, trackClick } = useAdSlot(position);
  const [hasTracked, setHasTracked] = React.useState(false);

  React.useEffect(() => {
    if (ad && !hasTracked) {
      trackImpression();
      setHasTracked(true);
    }
  }, [ad, hasTracked, trackImpression]);

  if (!ad) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("relative group overflow-hidden rounded-2xl border border-border-subtle", className)}
    >
      <div className="absolute top-2 right-2 z-10 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-text-tertiary pointer-events-none">
        Publicité
      </div>
      <a 
        href={ad.linkUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={trackClick}
        className="block relative overflow-hidden"
      >
        <img 
          src={ad.imageUrl} 
          alt={ad.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
           <span className="text-white text-xs font-bold flex items-center gap-2">
             En savoir plus <ExternalLink size={12} />
           </span>
        </div>
      </a>
    </motion.div>
  );
}
