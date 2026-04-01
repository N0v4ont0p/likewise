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
    default: 'bg-[var(--surface-3)] text-[var(--text-secondary)] border-[var(--border)]',
    pink:    'bg-[#2a1020] text-[#ff7090] border-[#4a1a35]',
    violet:  'bg-[#1a1230] text-[#a78bfa] border-[#2e2050]',
    success: 'bg-[#0d2218] text-emerald-400 border-[#1a3d2a]',
    error:   'bg-[#2a1020] text-red-400 border-[#4a1a28]',
    muted:   'bg-[var(--surface-2)] text-[var(--text-tertiary)] border-[var(--border-subtle)]',
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
