import * as React from 'react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  error?: string;
  helpText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, type, leftIcon: LeftIcon, rightIcon: RightIcon, error, helpText, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="text-sm font-semibold text-text-secondary ml-1">
            {label}
          </label>
        )}
        
        <div className="relative group">
          {LeftIcon && (
            <div className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
              isFocused ? "text-accent-green" : "text-text-tertiary"
            )}>
              <LeftIcon size={18} />
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "w-full bg-[#1E1E2E] border border-border-subtle rounded-xl h-12 transition-all outline-none text-white",
              "placeholder:text-text-tertiary px-4",
              LeftIcon && "pl-12",
              RightIcon && "pr-12",
              isFocused && "border-accent-green shadow-[0_0_0_3px_rgba(0,255,135,0.12)]",
              error && "border-danger",
              className
            )}
            {...props}
          />

          {RightIcon && (
            <div className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 transition-colors",
              isFocused ? "text-accent-green" : "text-text-tertiary"
            )}>
              <RightIcon size={18} />
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              initial={{ opacity: 0, height: 0, y: -5 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -5 }}
              className="text-xs font-medium text-danger px-1"
            >
              {error}
            </motion.p>
          ) : helpText ? (
            <p className="text-xs font-medium text-text-tertiary px-1">
              {helpText}
            </p>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = "Input";
