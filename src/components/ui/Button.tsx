import * as React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/src/lib/utils';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, asChild = false, loading = false, ...props }, ref) => {
    const variants = {
      primary: 'bg-pl-purple text-white hover:bg-pl-purple-dark shadow-pl',
      secondary: 'bg-pl-green text-pl-purple hover:bg-pl-green/90 shadow-pl',
      outline: 'border-2 border-pl-purple text-pl-purple hover:bg-pl-purple hover:text-white',
      ghost: 'text-text-secondary hover:bg-pl-purple/5 hover:text-pl-purple',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-pl',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg font-bold',
      icon: 'p-2',
    };

    if (asChild) {
      // Filter out motion props for Slot
      const { whileHover, whileTap, transition, initial, animate, exit, ...rest } = props as any;
      return (
        <Slot
          className={cn(
            'inline-flex items-center justify-center rounded-button font-sans font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent-green/50 disabled:opacity-50 disabled:pointer-events-none relative',
            fullWidth && 'w-full',
            variants[variant],
            sizes[size],
            className
          )}
          ref={ref}
          {...rest}
        >
          {loading ? (
             <>
               <span className="opacity-0">{rest.children}</span>
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
               </div>
             </>
          ) : rest.children}
        </Slot>
      );
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
        disabled={loading || props.disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-button font-display font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-pl-purple/50 disabled:opacity-50 disabled:pointer-events-none relative',
          fullWidth && 'w-full',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
           <>
             <span className="opacity-0">{props.children as React.ReactNode}</span>
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
             </div>
           </>
        ) : props.children as React.ReactNode}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
