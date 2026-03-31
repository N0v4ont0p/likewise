'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-white/70">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">{icon}</div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white placeholder-white/30',
              'focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50',
              'transition-all duration-200',
              icon && 'pl-10',
              error && 'border-red-500/50 focus:ring-red-500/30',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
