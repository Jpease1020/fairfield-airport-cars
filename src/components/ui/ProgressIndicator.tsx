import React from 'react';
import { cn } from '@/lib/utils/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  className?: string;
  variant?: 'default' | 'minimal' | 'detailed';
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  steps,
  className,
  variant = 'default'
}) => {
  const progress = (currentStep / totalSteps) * 100;

  if (variant === 'minimal') {
    return (
      <div className={cn('w-full', className)}>
        <div className="">
          <span className="">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="">
          <div 
            className=""
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('w-full', className)}>
        <div className="">
          <h3 className="">
            {steps[currentStep - 1]}
          </h3>
          <span className="">
            {currentStep} of {totalSteps}
          </span>
        </div>
        <div className="">
          <div className="">
            <div 
              className=""
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="">
            {steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors',
                  index < currentStep
                    ? 'bg-brand-primary text-text-inverse'
                    : index === currentStep
                    ? 'bg-brand-primary text-text-inverse ring-2 ring-brand-primary ring-offset-2'
                    : 'bg-bg-secondary text-text-secondary'
                )}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
        <div className="">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                'text-xs text-center max-w-20',
                index < currentStep
                  ? 'text-brand-primary font-medium'
                  : index === currentStep
                  ? 'text-brand-primary font-semibold'
                  : 'text-text-secondary'
              )}
            >
              {step}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('w-full', className)}>
      <div className="">
        <span className="">
          {steps[currentStep - 1]}
        </span>
        <span className="">
          {currentStep} of {totalSteps}
        </span>
      </div>
      <div className="">
        <div 
          className=""
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export { ProgressIndicator }; 