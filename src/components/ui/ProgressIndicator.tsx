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
      <div className={`progress-indicator progress-indicator-minimal ${className || ''}`}>
        <div className="progress-indicator-header">
          <span className="progress-indicator-step">Step {currentStep} of {totalSteps}</span>
          <span className="progress-indicator-percentage">{Math.round(progress)}%</span>
        </div>
        <div className="progress-indicator-bar">
          <div 
            className="progress-indicator-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`progress-indicator progress-indicator-detailed ${className || ''}`}>
        <div className="progress-indicator-header">
          <h3 className="progress-indicator-title">
            {steps[currentStep - 1]}
          </h3>
          <span className="progress-indicator-step">
            {currentStep} of {totalSteps}
          </span>
        </div>
        <div className="progress-indicator-content">
          <div className="progress-indicator-bar">
            <div 
              className="progress-indicator-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-indicator-steps">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`progress-indicator-step-item ${
                  index < currentStep
                    ? 'progress-indicator-step-completed'
                    : index === currentStep
                    ? 'progress-indicator-step-current'
                    : 'progress-indicator-step-pending'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
        <div className="progress-indicator-labels">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`progress-indicator-label ${
                index < currentStep
                  ? 'progress-indicator-label-completed'
                  : index === currentStep
                  ? 'progress-indicator-label-current'
                  : 'progress-indicator-label-pending'
              }`}
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
    <div className={`progress-indicator progress-indicator-default ${className || ''}`}>
      <div className="progress-indicator-header">
        <span className="progress-indicator-title">
          {steps[currentStep - 1]}
        </span>
        <span className="progress-indicator-step">
          {currentStep} of {totalSteps}
        </span>
      </div>
      <div className="progress-indicator-bar">
        <div 
          className="progress-indicator-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export { ProgressIndicator }; 