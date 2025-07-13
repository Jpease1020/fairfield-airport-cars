import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  completed?: boolean;
  current?: boolean;
}

interface ProgressIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: ProgressStep[];
  currentStep?: string;
  variant?: 'default' | 'vertical' | 'compact';
  showDescriptions?: boolean;
}

const ProgressIndicator = React.forwardRef<HTMLDivElement, ProgressIndicatorProps>(
  ({ 
    className, 
    steps, 
    currentStep,
    variant = 'default',
    showDescriptions = true,
    ...props 
  }, ref) => {
    const getStepStatus = (step: ProgressStep, index: number) => {
      const currentIndex = steps.findIndex(s => s.id === currentStep);
      
      if (step.current || step.id === currentStep) {
        return 'current';
      }
      if (step.completed || index < currentIndex) {
        return 'completed';
      }
      return 'pending';
    };

    const getStepClasses = (status: 'current' | 'completed' | 'pending') => {
      const baseClasses = 'flex items-center justify-center rounded-full font-medium transition-colors';
      
      switch (status) {
        case 'completed':
          return cn(baseClasses, 'bg-green-600 text-white');
        case 'current':
          return cn(baseClasses, 'bg-blue-600 text-white');
        case 'pending':
          return cn(baseClasses, 'bg-gray-200 text-gray-600');
      }
    };

    const getLineClasses = (status: 'completed' | 'pending') => {
      return cn(
        'transition-all duration-300',
        status === 'completed' ? 'bg-green-600' : 'bg-gray-200'
      );
    };

    if (variant === 'vertical') {
      return (
        <div ref={ref} className={cn('flex flex-col space-y-4', className)} {...props}>
          {steps.map((step, index) => {
            const status = getStepStatus(step, index);
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.id} className="flex items-start">
                <div className="flex flex-col items-center">
                  <div className={cn('w-8 h-8 text-sm', getStepClasses(status))}>
                    {step.completed ? '✓' : index + 1}
                  </div>
                  {!isLast && (
                    <div className={cn('w-0.5 h-8 mt-2', getLineClasses(status === 'completed' ? 'completed' : 'pending'))} />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="font-medium text-gray-900">{step.label}</div>
                  {showDescriptions && step.description && (
                    <div className="text-sm text-gray-600 mt-1">{step.description}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (variant === 'compact') {
      return (
        <div ref={ref} className={cn('flex items-center space-x-2', className)} {...props}>
          {steps.map((step, index) => {
            const status = getStepStatus(step, index);
            const isLast = index === steps.length - 1;
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div className={cn('w-6 h-6 text-xs', getStepClasses(status))}>
                    {step.completed ? '✓' : index + 1}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900">{step.label}</span>
                </div>
                {!isLast && (
                  <div className={cn('w-8 h-0.5', getLineClasses(status === 'completed' ? 'completed' : 'pending'))} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      );
    }

    // Default horizontal variant
    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {/* Progress Bar */}
        <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 transform -translate-y-1/2">
          <div 
            className="absolute left-0 h-1 bg-blue-600 transition-all duration-500"
            style={{ 
              width: `${(steps.filter((_, index) => getStepStatus(steps[index], index) === 'completed').length / (steps.length - 1)) * 100}%` 
            }}
          />
        </div>
        
        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step, index);
            
            return (
              <div key={step.id} className="text-center">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center mx-auto', getStepClasses(status))}>
                  {step.completed ? '✓' : index + 1}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-900">{step.label}</p>
                {showDescriptions && step.description && (
                  <p className="mt-1 text-xs text-gray-600">{step.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ProgressIndicator.displayName = 'ProgressIndicator';

export { ProgressIndicator }; 