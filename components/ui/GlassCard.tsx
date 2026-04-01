'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  interactive?: boolean;
}

export const GlassCard = ({
  children,
  className,
  glow = false,
  interactive = false,
  ...props
}: GlassCardProps) => {
  return (
    <motion.div
      whileHover={interactive ? { y: -2, scale: 1.005 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'relative rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-1)]',
        'shadow-[var(--shadow-sm)]',
        glow && 'border-[rgba(247,54,94,0.35)] shadow-[0_0_0_1px_rgba(247,54,94,0.15),var(--shadow-sm)]',
        interactive && 'cursor-pointer hover:bg-[var(--surface-2)] hover:border-[var(--surface-3)] transition-colors duration-150',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
