import * as React from 'react';
import { cn } from '@/src/lib/utils';

interface BadgeProps {
  label?: string;
  children?: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'default' | 'green' | 'primary' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ 
  label, 
  children,
  variant = 'default', 
  size = 'md', 
  className 
}: BadgeProps) {
  const variants = {
    success: "bg-accent-green/15 text-accent-green border-accent-green/20",
    warning: "bg-warning/15 text-warning border-warning/20",
    danger: "bg-danger/15 text-danger border-danger/20",
    default: "bg-background-secondary text-text-tertiary border-border-subtle",
    green: "bg-accent-green text-black border-accent-green",
    primary: "bg-accent-green/10 text-accent-green border-accent-green/20",
    outline: "bg-transparent text-text-secondary border-border-subtle",
  };

  const sizes = {
    sm: "text-[10px] py-0.5 px-2.5",
    md: "text-xs py-1 px-3",
  };

  return (
    <span className={cn(
      "inline-flex items-center justify-center font-semibold rounded-full border transition-all",
      variants[variant as keyof typeof variants] || variants.default,
      sizes[size],
      className
    )}>
      {label || children}
    </span>
  );
}
