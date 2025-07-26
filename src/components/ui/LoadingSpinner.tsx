import React from 'react';
import { cn } from '@/lib/utils/utils';
import { Loader2 } from 'lucide-react';

/**
 * A flexible loading spinner component with multiple variants and sizes
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <LoadingSpinner />
 * 
 * // With custom size and color
 * <LoadingSpinner size="lg" className="" />
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
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const SpinnerComponent = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'bg-current rounded-full animate-pulse',
                  size === 'sm' && 'h-1 w-1',
                  size === 'md' && 'h-1.5 w-1.5',
                  size === 'lg' && 'h-2 w-2',
                  size === 'xl' && 'h-3 w-3'
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div
            className={cn(
              'bg-current rounded-full animate-pulse',
              sizeClasses[size]
            )}
          />
        );

      default:
        return (
          <Loader2
            className={cn(
              'animate-spin',
              sizeClasses[size],
              className
            )}
          />
        );
    }
  };

  const content = (
    <div className="">
      <SpinnerComponent />
      {text && (
        <span className="">{text}</span>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="">
        {content}
      </div>
    );
  }

  return content;
};

export { LoadingSpinner }; 