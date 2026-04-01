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
    'inline-flex items-center justify-center font-medium rounded-[var(--radius-md)] transition-colors select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/40';

  const variants = {
    primary:
      'bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white hover:from-pink-400 hover:to-fuchsia-500 shadow-[0_4px_20px_rgba(236,72,153,0.3)] hover:shadow-[0_6px_28px_rgba(236,72,153,0.4)] border border-pink-500/20',
    secondary:
      'bg-white/[0.06] text-white hover:bg-white/[0.10] border border-white/[0.09] hover:border-white/[0.16]',
    ghost:
      'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent',
    danger:
      'bg-red-500/[0.12] text-red-300 hover:bg-red-500/[0.20] border border-red-500/[0.25] hover:border-red-500/[0.40]',
    outline:
      'bg-transparent text-pink-400 hover:bg-pink-500/10 border border-pink-500/30 hover:border-pink-500/50',
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-xs gap-1',
    sm: 'px-3.5 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-[0.9375rem] gap-2',
    lg: 'px-7 py-3.5 text-base gap-2',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02, y: disabled || loading ? 0 : -0.5 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.975 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
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
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-80"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};
