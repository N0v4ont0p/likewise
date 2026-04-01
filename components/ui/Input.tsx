'use client';

import { forwardRef, InputHTMLAttributes, useState, ReactNode } from 'react';
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
          <label className="block text-[0.8125rem] font-medium text-[var(--text-secondary)] tracking-wide">
            {label}
          </label>
        )}
        <div
          className={cn(
            'relative rounded-[var(--radius-md)] transition-shadow duration-200',
            isFocused
              ? 'shadow-[0_0_0_2px_rgba(247,54,94,0.4)]'
              : 'shadow-none'
          )}
        >
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] text-sm">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full rounded-[var(--radius-md)] bg-[var(--surface-2)] border px-4 py-3',
              'text-white text-[0.9375rem] placeholder-[var(--text-muted)]',
              'focus:outline-none transition-colors duration-150',
              isFocused
                ? 'border-[rgba(247,54,94,0.5)] bg-[var(--surface-3)]'
                : 'border-[var(--border)] hover:border-[#3a3a56]',
              error && 'border-red-500/60 focus:border-red-500/80',
              icon && 'pl-10',
              suffix && 'pr-10',
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
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] text-sm">
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--text-tertiary)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
