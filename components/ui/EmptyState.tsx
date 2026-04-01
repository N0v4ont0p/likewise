'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    className={cn(
      'flex flex-col items-center justify-center text-center py-14 px-6 space-y-3',
      className
    )}
  >
    {icon && (
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
        className="text-5xl mb-1"
      >
        {icon}
      </motion.div>
    )}
    <motion.h3
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="text-[1.0625rem] font-semibold text-white"
    >
      {title}
    </motion.h3>
    {description && (
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-sm text-[var(--text-secondary)] max-w-xs"
      >
        {description}
      </motion.p>
    )}
    {action && (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.27, duration: 0.3 }}
        className="pt-2"
      >
        {action}
      </motion.div>
    )}
  </motion.div>
);
