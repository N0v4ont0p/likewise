'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizes = {
    xs: { outer: 'h-4 w-4',   stroke: 3  },
    sm: { outer: 'h-5 w-5',   stroke: 3  },
    md: { outer: 'h-9 w-9',   stroke: 2.5 },
    lg: { outer: 'h-12 w-12', stroke: 2.5 },
  };
  const s = sizes[size];

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <motion.svg
        className={s.outer}
        viewBox="0 0 36 36"
        fill="none"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
      >
        {/* Track */}
        <circle cx="18" cy="18" r="15" stroke="var(--border)" strokeWidth={s.stroke} />
        {/* Active arc */}
        <circle
          cx="18" cy="18" r="15"
          stroke="url(#spinner-grad)"
          strokeWidth={s.stroke}
          strokeLinecap="round"
          strokeDasharray="60 94"
          strokeDashoffset="0"
        />
        <defs>
          <linearGradient id="spinner-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#f7365e" />
            <stop offset="100%" stopColor="#f06233" />
          </linearGradient>
        </defs>
      </motion.svg>
    </div>
  );
};

export const LoadingDots = ({ className }: { className?: string }) => (
  <div className={cn('flex items-center gap-1', className)}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="h-1.5 w-1.5 rounded-full bg-[var(--pink)]"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.75, 1.15, 0.75] }}
        transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
      />
    ))}
  </div>
);
