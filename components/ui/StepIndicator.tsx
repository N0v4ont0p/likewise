'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
  icon: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const StepIndicator = ({ steps, currentStep, className }: StepIndicatorProps) => {
  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <motion.div
                animate={{
                  backgroundColor: isCompleted
                    ? 'rgba(236,72,153,1)'
                    : isActive
                    ? 'rgba(236,72,153,0.15)'
                    : 'rgba(255,255,255,0.05)',
                  borderColor: isCompleted || isActive
                    ? 'rgba(236,72,153,0.6)'
                    : 'rgba(255,255,255,0.1)',
                  scale: isActive ? 1.08 : 1,
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className="h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm shadow-sm"
              >
                {isCompleted ? (
                  <motion.svg
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="white"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                ) : (
                  <span className={cn('text-xs', isActive ? 'opacity-100' : 'opacity-30')}>
                    {step.icon}
                  </span>
                )}
              </motion.div>
              <span
                className={cn(
                  'text-[0.65rem] font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'text-pink-400'
                    : isCompleted
                    ? 'text-white/50'
                    : 'text-white/18'
                )}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="relative flex-1 h-px mx-2 mb-4">
                <div className="absolute inset-0 bg-white/[0.07] rounded-full" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-full origin-left"
                  animate={{ scaleX: isCompleted ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
