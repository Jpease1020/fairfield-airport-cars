import React from 'react';
import { cn } from '@/lib/utils';

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
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-primary">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-text-secondary">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-bg-secondary rounded-full h-2">
          <div 
            className="h-2 bg-brand-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('w-full', className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            {steps[currentStep - 1]}
          </h3>
          <span className="text-sm text-text-secondary">
            {currentStep} of {totalSteps}
          </span>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-bg-secondary transform -translate-y-1/2">
            <div 
              className="absolute left-0 h-1 bg-brand-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="relative flex justify-between">
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
        <div className="mt-4 flex justify-between">
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
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text-primary">
          {steps[currentStep - 1]}
        </span>
        <span className="text-sm text-text-secondary">
          {currentStep} of {totalSteps}
        </span>
      </div>
      <div className="w-full bg-bg-secondary rounded-full h-2">
        <div 
          className="h-2 bg-brand-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export { ProgressIndicator }; 