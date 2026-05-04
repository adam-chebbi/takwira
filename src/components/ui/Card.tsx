import * as React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface CardProps extends HTMLMotionProps<'div'> {
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = true, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hoverEffect ? { scale: 1.02, y: -4 } : {}}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn(
          'bg-white border border-border-subtle rounded-card p-5 shadow-pl',
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
