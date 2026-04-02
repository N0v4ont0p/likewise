'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'blue' | 'violet' | 'success' | 'error' | 'muted';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge = ({ children, variant = 'default', size = 'sm', className }: BadgeProps) => {
  const variants = {
    default: 'bg-[var(--surface-3)] text-[var(--text-secondary)] border-[var(--border)]',
    blue:    'bg-[rgba(59,130,246,0.1)] text-[#60a5fa] border-[rgba(59,130,246,0.25)]',
    violet:  'bg-[rgba(139,92,246,0.1)] text-[#a78bfa] border-[rgba(139,92,246,0.25)]',
    success: 'bg-[rgba(16,185,129,0.08)] text-emerald-400 border-[rgba(16,185,129,0.2)]',
    error:   'bg-[rgba(239,68,68,0.08)] text-red-400 border-[rgba(239,68,68,0.2)]',
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
