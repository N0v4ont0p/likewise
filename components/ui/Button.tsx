'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ComponentPropsWithoutRef, ReactNode } from 'react';

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
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
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 select-none disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-transparent hover:shadow-pink-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/50';

  const variants = {
    primary: 'bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent),linear-gradient(120deg,#ec4899,#f43f5e)] text-white hover:brightness-105 active:brightness-95 border border-pink-500/40',
    secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10',
    ghost: 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent',
    danger: 'bg-red-500/20 text-red-200 hover:bg-red-500/30 border border-red-500/30',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.015, y: disabled || loading ? 0 : -1 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.985 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {children}
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};
