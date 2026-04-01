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
                    ? 'linear-gradient(135deg, #f7365e, #f06233)'
                    : isActive
                    ? 'rgba(247,54,94,0.18)'
                    : 'rgba(255,255,255,0.04)',
                  borderColor: isCompleted
                    ? 'rgba(247,54,94,0.7)'
                    : isActive
                    ? 'rgba(247,54,94,0.55)'
                    : 'rgba(255,255,255,0.08)',
                  scale: isActive ? 1.1 : 1,
                  boxShadow: isActive
                    ? '0 0 0 4px rgba(247,54,94,0.15)'
                    : '0 0 0 0px rgba(247,54,94,0)',
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className="h-9 w-9 rounded-full border-2 flex items-center justify-center text-sm"
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
                  <span className={cn('text-sm', isActive ? 'opacity-100' : 'opacity-30')}>
                    {step.icon}
                  </span>
                )}
              </motion.div>
              <span
                className={cn(
                  'text-[0.625rem] font-semibold transition-colors whitespace-nowrap tracking-wide',
                  isActive
                    ? 'text-[var(--pink-light)]'
                    : isCompleted
                    ? 'text-[var(--text-tertiary)]'
                    : 'text-[var(--text-muted)]'
                )}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="relative flex-1 h-[2px] mx-2 mb-4 rounded-full overflow-hidden bg-[var(--surface-3)]">
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[#f7365e] to-[#c026d3] origin-left"
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
