import * as React from 'react';
import { cn } from '@/lib/utils/utils';

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
            className=""
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            <div className="" />
          </div>
        )}
        
        <div className={contentClasses}>
          {subtitle && (
            <p className="">
              {subtitle}
            </p>
          )}
          
          <h1 className="">
            {title}
          </h1>
          
          {description && (
            <p className="">
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
                  className=""
                >
                  {primaryAction.label}
                </a>
              )}
              
              {secondaryAction && (
                <a 
                  href={secondaryAction.href}
                  className=""
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