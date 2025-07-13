import * as React from 'react';
import { cn } from '@/lib/utils';

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  description?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  backgroundImage?: string;
  variant?: 'default' | 'centered' | 'split';
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  ({ 
    className, 
    title, 
    subtitle, 
    description,
    primaryAction,
    secondaryAction,
    backgroundImage,
    variant = 'default',
    ...props 
  }, ref) => {
    const containerClasses = cn(
      'relative overflow-hidden',
      variant === 'centered' ? 'text-center' : '',
      className
    );

    const contentClasses = cn(
      'relative z-10',
      variant === 'centered' ? 'max-w-3xl mx-auto' : 'max-w-2xl',
      'py-16 px-4 sm:px-6 lg:px-8'
    );

    return (
      <div ref={ref} className={containerClasses} {...props}>
        {backgroundImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50" />
          </div>
        )}
        
        <div className={contentClasses}>
          {subtitle && (
            <p className="text-lg text-indigo-600 font-semibold mb-4">
              {subtitle}
            </p>
          )}
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          
          {description && (
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              {description}
            </p>
          )}
          
          {(primaryAction || secondaryAction) && (
            <div className={cn(
              'flex flex-col sm:flex-row gap-4',
              variant === 'centered' ? 'justify-center' : ''
            )}>
              {primaryAction && (
                <a 
                  href={primaryAction.href}
                  className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {primaryAction.label}
                </a>
              )}
              
              {secondaryAction && (
                <a 
                  href={secondaryAction.href}
                  className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {secondaryAction.label}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);
HeroSection.displayName = 'HeroSection';

export { HeroSection }; 