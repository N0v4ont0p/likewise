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
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'relative rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-1)] shadow-[var(--shadow-sm)]',
        glow && [
          'border-[rgba(59,130,246,0.3)]',
          'shadow-[0_0_0_1px_rgba(59,130,246,0.08),var(--shadow-md)]',
        ],
        interactive && 'cursor-pointer hover:bg-[var(--surface-2)] hover:border-[var(--border-strong)] transition-colors duration-150',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
