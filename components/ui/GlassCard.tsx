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
      whileHover={interactive ? { y: -3, scale: 1.008 } : undefined}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={cn(
        'relative rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-1)] shadow-[var(--shadow-sm)]',
        glow && [
          'border-[rgba(247,54,94,0.32)]',
          'shadow-[0_0_0_1px_rgba(247,54,94,0.12),var(--shadow-md)]',
        ],
        interactive && 'cursor-pointer hover:bg-[var(--surface-2)] hover:border-[#343450] transition-colors duration-150',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
