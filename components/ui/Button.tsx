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
    'relative inline-flex items-center justify-center font-semibold rounded-[var(--radius-md)] transition-all select-none overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pink)]/50';

  const variants = {
    primary:
      'bg-gradient-to-r from-[#f7365e] to-[#f06233] text-white shadow-[var(--shadow-pink)] hover:shadow-[0_8px_36px_rgba(247,54,94,0.5)] hover:from-[#ff4d70] hover:to-[#f57040]',
    secondary:
      'bg-[var(--surface-2)] text-white border border-[var(--border)] hover:bg-[var(--surface-3)] hover:border-[#3a3a58]',
    ghost:
      'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-2)]',
    danger:
      'bg-[#2a1520] text-red-400 border border-[#4a1a28] hover:bg-[#3a1a28] hover:border-[#6a2038]',
    outline:
      'bg-transparent text-[var(--pink)] border border-[rgba(247,54,94,0.4)] hover:bg-[var(--pink-dim)] hover:border-[var(--pink)]',
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-xs gap-1',
    sm: 'px-3.5 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-[0.9375rem] gap-2',
    lg: 'px-7 py-3.5 text-base gap-2',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.025, y: disabled || loading ? 0 : -1 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {/* Shine sweep for primary */}
      {variant === 'primary' && !disabled && !loading && (
        <motion.span
          className="absolute inset-0 -translate-x-full skew-x-[-18deg] bg-white/[0.13] pointer-events-none"
          whileHover={{ translateX: '200%' }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
        />
      )}
      {loading ? (
        <>
          <svg
            className="animate-spin h-[1em] w-[1em] shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-85" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};
