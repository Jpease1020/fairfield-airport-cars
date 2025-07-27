import React from 'react';

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
      <div className={className}>
        <div>
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div>
          <div style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={className}>
        <div>
          <h3>
            {steps[currentStep - 1]}
          </h3>
          <span>
            {currentStep} of {totalSteps}
          </span>
        </div>
        <div>
          <div>
            <div style={{ width: `${progress}%` }} />
          </div>
          <div>
            {steps.map((step, index) => (
              <div key={index}>
                {index + 1}
              </div>
            ))}
          </div>
        </div>
        <div>
          {steps.map((step, index) => (
            <div key={index}>
              {step}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={className}>
      <div>
        <span>
          {steps[currentStep - 1]}
        </span>
        <span>
          {currentStep} of {totalSteps}
        </span>
      </div>
      <div>
        <div style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

export { ProgressIndicator }; 