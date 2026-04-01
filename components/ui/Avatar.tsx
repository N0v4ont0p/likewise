'use client';

import { cn } from '@/lib/utils';

const GRADIENTS = [
  'from-pink-500/50 to-fuchsia-600/50',
  'from-violet-500/50 to-purple-600/50',
  'from-rose-500/50 to-pink-600/50',
  'from-fuchsia-500/50 to-violet-600/50',
  'from-pink-400/50 to-rose-500/50',
  'from-purple-500/50 to-fuchsia-600/50',
];

const getGradient = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
};

interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showRing?: boolean;
  badge?: string;
}

const sizes = {
  xs: { container: 'h-7 w-7', text: 'text-xs', badge: 'h-3.5 w-3.5 text-[8px]' },
  sm: { container: 'h-9 w-9', text: 'text-sm', badge: 'h-4 w-4 text-[9px]' },
  md: { container: 'h-11 w-11', text: 'text-base', badge: 'h-4.5 w-4.5 text-[9px]' },
  lg: { container: 'h-14 w-14', text: 'text-lg', badge: 'h-5 w-5 text-[10px]' },
  xl: { container: 'h-20 w-20', text: 'text-2xl', badge: 'h-6 w-6 text-xs' },
};

export const Avatar = ({ name, size = 'md', className, showRing = false, badge }: AvatarProps) => {
  const initial = (name || '?')[0].toUpperCase();
  const gradient = getGradient(name);
  const s = sizes[size];

  return (
    <div className={cn('relative shrink-0', s.container, className)}>
      <div
        className={cn(
          'h-full w-full rounded-full flex items-center justify-center font-semibold text-white select-none',
          `bg-gradient-to-br ${gradient}`,
          showRing && 'ring-2 ring-pink-500/30 ring-offset-1 ring-offset-[#07070f]'
        )}
      >
        <span className={s.text}>{initial}</span>
      </div>
      {badge && (
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full bg-[#07070f] flex items-center justify-center',
            s.badge
          )}
        >
          <span>{badge}</span>
        </div>
      )}
    </div>
  );
};
