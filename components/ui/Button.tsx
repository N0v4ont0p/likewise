'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ComponentPropsWithoutRef, ReactNode } from 'react';

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof motion.button>, 'children'>;

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold transition-all select-none overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)]/50';

  const variants = {
    primary:
      'bg-[var(--blue)] text-white rounded-lg hover:bg-[var(--blue-dark)] hover:shadow-[var(--shadow-blue)]',
    secondary:
      'bg-transparent text-[var(--text-secondary)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]',
    ghost:
      'bg-transparent text-[var(--text-secondary)] rounded-lg hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]',
    danger:
      'bg-[rgba(239,68,68,0.08)] text-red-400 border border-[rgba(239,68,68,0.2)] rounded-lg hover:bg-[rgba(239,68,68,0.14)] hover:border-[rgba(239,68,68,0.35)]',
    outline:
      'bg-transparent text-[var(--blue-light)] border border-[var(--border-accent)] rounded-lg hover:bg-[var(--blue-dim)] hover:border-[var(--blue)]',
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-xs gap-1',
    sm: 'px-3.5 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-[0.9375rem] gap-2',
    lg: 'px-7 py-3.5 text-base gap-2',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-[1em] w-[1em] shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};
