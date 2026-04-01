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
    <div className={cn('flex items-center justify-center gap-0', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isCompleted
                    ? 'rgba(236,72,153,0.9)'
                    : isActive
                    ? 'rgba(236,72,153,0.2)'
                    : 'rgba(255,255,255,0.06)',
                  borderColor: isCompleted || isActive
                    ? 'rgba(236,72,153,0.6)'
                    : 'rgba(255,255,255,0.12)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="h-9 w-9 rounded-full border flex items-center justify-center text-base shadow-lg"
              >
                {isCompleted ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    ✓
                  </motion.span>
                ) : (
                  <span className={isActive ? 'opacity-100' : 'opacity-30'}>{step.icon}</span>
                )}
              </motion.div>
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  isActive ? 'text-pink-400' : isCompleted ? 'text-white/60' : 'text-white/20'
                )}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="relative mx-2 mb-4 h-px w-10">
                <div className="absolute inset-0 bg-white/10 rounded-full" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full origin-left"
                  animate={{ scaleX: isCompleted ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
