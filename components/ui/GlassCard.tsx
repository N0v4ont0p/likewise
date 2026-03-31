'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassCard = ({ children, className, glow = false, ...props }: GlassCardProps) => {
  return (
    <motion.div
      className={cn(
        'relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl',
        glow && 'shadow-pink-500/20 border-pink-500/20',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
