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
                  background: isCompleted
                    ? '#3b82f6'
                    : isActive
                    ? 'rgba(59,130,246,0.12)'
                    : 'rgba(255,255,255,0.04)',
                  borderColor: isCompleted
                    ? '#3b82f6'
                    : isActive
                    ? 'rgba(59,130,246,0.6)'
                    : 'rgba(255,255,255,0.08)',
                  scale: isActive ? 1.08 : 1,
                  boxShadow: isActive
                    ? '0 0 0 4px rgba(59,130,246,0.15)'
                    : '0 0 0 0px rgba(59,130,246,0)',
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className="h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold text-white"
              >
                {isCompleted ? (
                  <motion.svg
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 16 }}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                ) : (
                  <span className={cn('text-xs font-bold', isActive ? 'text-[var(--blue-light)]' : 'text-[var(--text-tertiary)]')}>
                    {index + 1}
                  </span>
                )}
              </motion.div>
              <span
                className={cn(
                  'text-[0.625rem] font-semibold transition-colors whitespace-nowrap tracking-wide',
                  isActive
                    ? 'text-[var(--blue-light)]'
                    : isCompleted
                    ? 'text-[var(--text-secondary)]'
                    : 'text-[var(--text-tertiary)]'
                )}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="relative flex-1 h-[2px] mx-2 mb-4 rounded-full overflow-hidden bg-[var(--surface-3)]">
                <motion.div
                  className="absolute inset-0 rounded-full origin-left"
                  style={{ background: 'linear-gradient(90deg, #3b82f6, #06b6d4)' }}
                  animate={{ scaleX: isCompleted ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
