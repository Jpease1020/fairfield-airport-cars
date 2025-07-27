import React from 'react';
import { cn } from '@/lib/utils/utils';
import { Loader2 } from 'lucide-react';

/**
 * A flexible loading spinner component with multiple variants and sizes
 * 
 * @example
 * // Basic usage
 * <LoadingSpinner />
 * 
 * // With text
 * <LoadingSpinner text="Loading..." />
 * 
 * // Dots variant
 * <LoadingSpinner variant="dots" />
 * ```
 */
interface LoadingSpinnerProps {
  /** The size of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** The variant of the spinner */
  variant?: 'spinner' | 'dots' | 'pulse';
  /** Text to display with the spinner */
  text?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether the spinner should be centered */
  centered?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  className,
  centered = false,
}) => {
  const SpinnerComponent = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="loading-spinner-dots">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`loading-spinner-dot loading-spinner-dot-${size}`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className={`loading-spinner-pulse loading-spinner-pulse-${size}`} />
        );

      default:
        return (
          <div className={`loading-spinner-icon loading-spinner-icon-${size} ${className || ''}`} />
        );
    }
  };

  const content = (
    <div className="loading-spinner">
      <SpinnerComponent />
      {text && (
        <span className="loading-spinner-text">{text}</span>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="loading-spinner-centered">
        {content}
      </div>
    );
  }

  return content;
};

export { LoadingSpinner }; 