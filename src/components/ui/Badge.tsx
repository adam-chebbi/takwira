import * as React from 'react';
import { cn } from '@/src/lib/utils';

interface BadgeProps {
  label?: string;
  children?: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'default' | 'green' | 'primary' | 'outline' | 'purple';
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
    success: "bg-pl-green/15 text-pl-purple border-pl-green/20",
    warning: "bg-orange-500/15 text-orange-600 border-orange-500/20",
    danger: "bg-red-500/15 text-red-600 border-red-500/20",
    default: "bg-white text-text-secondary border-border-subtle",
    green: "bg-pl-green text-pl-purple border-pl-green",
    primary: "bg-pl-purple/10 text-pl-purple border-pl-purple/20",
    purple: "bg-pl-purple text-white border-pl-purple",
    outline: "bg-transparent text-text-secondary border-border-subtle",
  };

  const sizes = {
    sm: "text-[10px] py-0.5 px-2.5",
    md: "text-xs py-1 px-3",
  };

  return (
    <span className={cn(
      "inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-badge border transition-all",
      variants[variant as keyof typeof variants] || variants.default,
      sizes[size],
      className
    )}>
      {label || children}
    </span>
  );
}
