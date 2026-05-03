import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { cn } from '@/src/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  className?: string;
  aspectRatio?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  className, 
  aspectRatio = "aspect-video",
  alt = "",
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  // Append alt=media for Firebase Storage if not already present
  const optimizedSrc = React.useMemo(() => {
    if (src.includes('firebasestorage.googleapis.com') && !src.includes('alt=media')) {
      return `${src}${src.includes('?') ? '&' : '?'}alt=media`;
    }
    return src;
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden", aspectRatio, className)}>
      <AnimatePresence>
        {!isLoaded && !error && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
          >
            <Skeleton className="w-full h-full" />
          </motion.div>
        )}
      </AnimatePresence>

      <img
        src={optimizedSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          "w-full h-full object-cover transition-all duration-700",
          isLoaded ? "scale-100 opacity-100 blur-0" : "scale-110 opacity-0 blur-lg"
        )}
        {...props}
      />

      {error && (
        <div className="absolute inset-0 bg-background-secondary flex items-center justify-center text-[10px] font-black uppercase text-text-tertiary">
          Image non disponible
        </div>
      )}
    </div>
  );
};
