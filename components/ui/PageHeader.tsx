'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean | string;
  actions?: ReactNode;
  breadcrumb?: { label: string; href?: string }[];
  className?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  back,
  actions,
  breadcrumb,
  className,
}: PageHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (typeof back === 'string') {
      router.push(back);
    } else {
      router.back();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className={cn('flex items-start justify-between gap-4', className)}
    >
      <div className="flex items-center gap-3 min-w-0">
        {back !== undefined && (
          <button
            onClick={handleBack}
            className="shrink-0 h-8 w-8 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)] hover:border-[var(--border-strong)] transition-colors"
            aria-label="Go back"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
              <path
                d="M9 11.5L4.5 7L9 2.5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <div className="min-w-0">
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="flex items-center gap-1.5 mb-0.5">
              {breadcrumb.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ color: 'var(--text-tertiary)' }}>
                      <path d="M2 1.5l3 2.5-3 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  <span className="text-[0.6875rem] font-medium tracking-wide truncate" style={{ color: 'var(--text-tertiary)' }}>{crumb.label}</span>
                </span>
              ))}
            </div>
          )}
          <h1 className="text-[1.25rem] font-bold truncate leading-tight tracking-tight" style={{ color: 'var(--text-primary)' }}>{title}</h1>
          {subtitle && (
            <p className="text-[0.8125rem] mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </motion.div>
  );
};

