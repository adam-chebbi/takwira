import * as React from 'react';
import { cn } from '@/src/lib/utils';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  key?: React.Key;
}

export function Skeleton({ 
  width, 
  height, 
  borderRadius = '8px', 
  className 
}: SkeletonProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-background-secondary/50",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-accent-green/[0.06] before:to-transparent",
        className
      )}
      style={{ 
        width: width ?? '100%', 
        height: height ?? '1rem',
        borderRadius 
      }}
    />
  );
}

// Pre-built variants
export const SkeletonCard = () => (
  <div className="bg-background-card border border-border-subtle rounded-[24px] p-6 space-y-4">
    <Skeleton height={200} borderRadius="16px" />
    <div className="space-y-2">
      <Skeleton width="60%" height={24} />
      <Skeleton width="40%" height={16} />
    </div>
    <div className="flex justify-between items-center pt-2">
      <Skeleton width="30%" height={28} />
      <Skeleton width="25%" height={36} borderRadius="10px" />
    </div>
  </div>
);

export const TerrainSkeleton = SkeletonCard;

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        className={cn(i === lines - 1 ? 'w-[70%]' : 'w-full')} 
        height={12} 
      />
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = 48 }: { size?: number }) => (
  <Skeleton width={size} height={size} borderRadius="50%" />
);

export const SkeletonBadge = () => (
  <Skeleton width={80} height={24} borderRadius="12px" />
);
