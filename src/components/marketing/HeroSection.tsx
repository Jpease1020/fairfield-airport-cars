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
            <div className="absolute inset-0 bg-bg-inverse bg-opacity-50" />
          </div>
        )}
        
        <div className={contentClasses}>
          {subtitle && (
            <p className="text-lg text-brand-primary font-semibold mb-4">
              {subtitle}
            </p>
          )}
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
            {title}
          </h1>
          
          {description && (
            <p className="text-xl text-text-secondary mb-8 max-w-2xl">
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
                  className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-text-inverse bg-brand-primary border border-transparent rounded-md shadow-sm hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                >
                  {primaryAction.label}
                </a>
              )}
              
              {secondaryAction && (
                <a 
                  href={secondaryAction.href}
                  className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-text-primary bg-bg-primary border border-border-primary rounded-md shadow-sm hover:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
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