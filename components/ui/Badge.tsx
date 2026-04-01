'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'pink' | 'violet' | 'success' | 'error' | 'muted';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge = ({ children, variant = 'default', size = 'sm', className }: BadgeProps) => {
  const variants = {
    default: 'bg-white/[0.07] text-white/60 border-white/[0.08]',
    pink: 'bg-pink-500/[0.15] text-pink-300 border-pink-500/[0.25]',
    violet: 'bg-violet-500/[0.15] text-violet-300 border-violet-500/[0.25]',
    success: 'bg-emerald-500/[0.15] text-emerald-300 border-emerald-500/[0.25]',
    error: 'bg-red-500/[0.15] text-red-300 border-red-500/[0.25]',
    muted: 'bg-white/[0.04] text-white/30 border-white/[0.06]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[0.6875rem] rounded-full',
    md: 'px-2.5 py-1 text-xs rounded-[6px]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};
