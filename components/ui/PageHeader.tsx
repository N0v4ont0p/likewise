'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { Button } from './Button';

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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn('flex items-start justify-between gap-4', className)}
    >
      <div className="flex items-center gap-3 min-w-0">
        {back !== undefined && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="shrink-0 h-9 w-9 p-0 rounded-full"
            aria-label="Go back"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        )}
        <div className="min-w-0">
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="flex items-center gap-1.5 mb-0.5">
              {breadcrumb.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-white/20 text-[10px]">›</span>}
                  <span className="text-[0.6875rem] text-white/35 truncate">{crumb.label}</span>
                </span>
              ))}
            </div>
          )}
          <h1 className="text-[1.3125rem] font-bold text-white truncate leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-[0.8125rem] text-white/40 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </motion.div>
  );
};
