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
        'relative rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-1)] backdrop-blur-xl',
        glow && 'shadow-[0_0_40px_rgba(236,72,153,0.12)] border-[var(--border-accent)]',
        interactive && 'cursor-pointer hover:border-white/[0.13] hover:bg-[var(--surface-2)]',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
