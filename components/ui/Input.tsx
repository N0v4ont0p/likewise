'use client';

import { forwardRef, InputHTMLAttributes, useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-white/70 tracking-wide">{label}</label>
        )}
        <motion.div
          animate={{
            boxShadow: isFocused
              ? '0 10px 45px rgba(244, 63, 94, 0.18)'
              : '0 8px 28px rgba(0,0,0,0.25)',
            y: isFocused ? -1 : 0,
          }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative rounded-xl"
        >
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">{icon}</div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white placeholder-white/30',
              'focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50',
              'transition-all duration-200 transform-gpu',
              icon && 'pl-10',
              error && 'border-red-500/50 focus:ring-red-500/30',
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
        </motion.div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
