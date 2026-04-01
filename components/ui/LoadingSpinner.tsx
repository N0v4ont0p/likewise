'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizes = {
    xs: 'h-4 w-4',
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-11 w-11',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <motion.div
        className={cn(
          sizes[size],
          'rounded-full border-[2px] border-white/10 border-t-pink-500'
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export const LoadingDots = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center gap-1', className)}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="h-1.5 w-1.5 rounded-full bg-pink-500/70"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
      />
    ))}
  </div>
);
