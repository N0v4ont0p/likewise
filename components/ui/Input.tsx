'use client';

import { forwardRef, InputHTMLAttributes, useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, suffix, className, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-[0.8125rem] font-medium text-white/50 tracking-wide">
            {label}
          </label>
        )}
        <motion.div
          animate={{
            boxShadow: isFocused
              ? '0 0 0 2px rgba(236,72,153,0.35), 0 8px 32px rgba(236,72,153,0.12)'
              : '0 0 0 0px rgba(236,72,153,0)',
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative rounded-[var(--radius-md)]"
        >
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--border)] px-4 py-3 text-white text-[0.9375rem] placeholder-white/20',
              'focus:outline-none focus:border-pink-500/40 focus:bg-[var(--surface-3)]',
              'transition-colors duration-200',
              icon && 'pl-10',
              suffix && 'pr-10',
              error && 'border-red-500/40 focus:border-red-500/60',
              className
            )}
            aria-invalid={Boolean(error)}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm">
              {suffix}
            </div>
          )}
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-400 flex items-center gap-1"
          >
            <span>⚠</span> {error}
          </motion.p>
        )}
        {hint && !error && (
          <p className="text-xs text-white/25">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
