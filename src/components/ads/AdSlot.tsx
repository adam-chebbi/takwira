import * as React from 'react';
import { useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  limit, 
  onSnapshot,
  doc,
  updateDoc,
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { AdSlot as AdSlotType } from '@/src/lib/schema';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useCookie } from '@/src/contexts/CookieContext';

interface AdSlotProps {
  position: 'blog_list_between' | 'blog_post_inline' | 'blog_sidebar_top' | 'blog_sidebar_bottom';
  className?: string;
}

const MIN_HEIGHTS = {
  blog_list_between: '90px',
  blog_sidebar_top: '250px',
  blog_sidebar_bottom: '250px',
  blog_post_inline: '280px',
};

const SLOT_MAPPING = {
  blog_list_between: process.env.VITE_ADSENSE_SLOT_BLOG_LIST,
  blog_sidebar_top: process.env.VITE_ADSENSE_SLOT_SIDEBAR_TOP,
  blog_sidebar_bottom: process.env.VITE_ADSENSE_SLOT_SIDEBAR_BOTTOM,
  blog_post_inline: process.env.VITE_ADSENSE_SLOT_INLINE,
};

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdSlot({ position, className }: AdSlotProps) {
  const { canTrackAdvertising } = useCookie();
  const [ad, setAd] = React.useState<AdSlotType | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [adsenseAvailable, setAdsenseAvailable] = React.useState(false);
  const [adLoaded, setAdLoaded] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(false);
  const impressionTracked = React.useRef(false);

  // Check for AdSense availability and mobile status
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (canTrackAdvertising && window.adsbygoogle) {
      setAdsenseAvailable(true);
    }
    return () => window.removeEventListener('resize', checkMobile);
  }, [canTrackAdvertising]);

  // Ad refresh logic for inline article ad
  React.useEffect(() => {
    if (position !== 'blog_post_inline' || !adsenseAvailable) return;

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        console.log('AdSense: Refreshing inline ad');
        setRefreshKey(prev => prev + 1);
        setAdLoaded(false);
      }
    }, 180000); // 3 minutes

    return () => clearInterval(intervalId);
  }, [adsenseAvailable, position]);

  // AdSense initialization
  React.useEffect(() => {
    if (adsenseAvailable) {
      try {
        setAdLoaded(true);
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense initialization error:", e);
      }
    }
  }, [adsenseAvailable, position, refreshKey]);

  useEffect(() => {
    // Only fetch custom ads if AdSense is NOT being used
    if (adsenseAvailable) return;

    const today = Timestamp.now();
    const q = query(
      collection(db, 'adSlots'),
      where('position', '==', position),
      where('isActive', '==', true),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeAds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdSlotType));
      
      const validAd = activeAds.find(a => {
        const starts = a.startDate.toMillis() <= today.toMillis();
        const ends = !a.endDate || a.endDate.toMillis() >= today.toMillis();
        return starts && ends;
      });

      setAd(validAd || null);
      setLoading(false);
      impressionTracked.current = false;
    });

    return () => unsubscribe();
  }, [position, adsenseAvailable]);

  const trackImpression = React.useCallback(async () => {
    if (ad && !impressionTracked.current && canTrackAdvertising) {
      impressionTracked.current = true;
      try {
        await updateDoc(doc(db, 'adSlots', ad.id), {
          impressionCount: increment(1)
        });
      } catch (e) {
        console.error("Ad impression tracking failed", e);
      }
    }
  }, [ad, canTrackAdvertising]);

  const trackClick = React.useCallback(async () => {
    if (ad && canTrackAdvertising) {
      try {
        await updateDoc(doc(db, 'adSlots', ad.id), {
          clickCount: increment(1)
        });
      } catch (e) {
        console.error("Ad click tracking failed", e);
      }
    }
  }, [ad, canTrackAdvertising]);

  React.useEffect(() => {
    if (ad) {
      trackImpression();
    }
  }, [ad, trackImpression]);

  // Hide sidebar ads on mobile
  if (isMobile && position.includes('sidebar')) {
    return null;
  }

  if (!canTrackAdvertising) {
    return (
      <div 
        className={cn(
          "relative flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-border-subtle bg-white shadow-pl",
          className
        )}
        style={{ minHeight: MIN_HEIGHTS[position] }}
      >
        <div className="absolute top-2 left-2 z-10 bg-pl-purple/90 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest text-white pointer-events-none border border-white/10">
          Publicité
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted max-w-[200px]">
          Activez les cookies publicitaires pour voir les annonces
        </p>
      </div>
    );
  }

  // Render AdSense if available
  if (adsenseAvailable && SLOT_MAPPING[position]) {
    const isSidebar = position.includes('sidebar');
    const isInline = position === 'blog_post_inline';
    
    return (
      <div 
        key={refreshKey}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border-subtle bg-white p-4 max-w-full shadow-pl", 
          !adLoaded && "skeleton-shimmer",
          className
        )}
        style={{ minHeight: MIN_HEIGHTS[position] }}
      >
        <div className="mb-2 text-[8px] font-bold uppercase tracking-widest text-pl-purple/60">
          Publicité (AdSense)
        </div>
        <ins 
          className="adsbygoogle"
          style={{ 
            display: 'block',
            ...(isSidebar ? { width: '100%', height: '250px' } : {}),
            ...(isInline ? { minHeight: '100px' } : {})
          }}
          data-ad-client={process.env.VITE_ADSENSE_PUBLISHER_ID}
          data-ad-slot={SLOT_MAPPING[position]}
          data-ad-format={isSidebar ? 'rectangle' : isInline ? 'auto' : 'horizontal'}
          {...(isInline ? { 'data-full-width-responsive': "true" } : {})}
        ></ins>
        <AnimatePresence>
          {!adLoaded && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white z-10"
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (loading || !ad) {
    return (
      <div 
        className={cn("rounded-2xl border border-border-subtle bg-white/50 animate-pulse shadow-pl", className)}
        style={{ minHeight: MIN_HEIGHTS[position] }}
      />
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn("relative group overflow-hidden rounded-2xl border border-border-subtle bg-white max-w-full shadow-pl", className)}
        style={{ minHeight: MIN_HEIGHTS[position] }}
      >
        <div className="absolute top-2 left-2 z-10 bg-pl-purple/90 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest text-white pointer-events-none border border-white/10">
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
            alt={ad.altText || ad.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pl-purple/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
             <span className="text-white text-xs font-bold flex items-center gap-2 uppercase tracking-wide">
                En savoir plus <ExternalLink size={12} />
             </span>
          </div>
        </a>
      </motion.div>
    </AnimatePresence>
  );
}
