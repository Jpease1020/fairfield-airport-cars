import * as React from 'react';
import { cn } from '@/lib/utils/utils';

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'highlighted' | 'minimal';
  href?: string;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ 
    className, 
    title, 
    description, 
    icon,
    variant = 'default',
    href,
    ...props 
  }, ref) => {
    const cardClasses = cn(
      'group relative',
      variant === 'highlighted' ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200' : 'bg-white',
      variant === 'minimal' ? 'border-0 shadow-none' : 'border border-gray-200 shadow-sm',
      'rounded-lg p-6 transition-all duration-200',
      href ? 'cursor-pointer hover:shadow-md hover:border-indigo-300' : '',
      className
    );

    const content = (
      <>
        {icon && (
          <div className={cn(
            'flex items-center justify-center w-12 h-12 rounded-lg mb-4',
            variant === 'highlighted' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600',
            'group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors'
          )}>
            {icon}
          </div>
        )}
        
        <h3 className={cn(
          'text-lg font-semibold mb-2',
          variant === 'highlighted' ? 'text-indigo-900' : 'text-gray-900'
        )}>
          {title}
        </h3>
        
        <p className={cn(
          'text-sm leading-relaxed',
          variant === 'highlighted' ? 'text-indigo-700' : 'text-gray-600'
        )}>
          {description}
        </p>
        
        {href && (
          <div className="">
            Learn more
            <svg className="" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </>
    );

    if (href) {
      return (
        <a href={href} className={cardClasses}>
          {content}
        </a>
      );
    }

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {content}
      </div>
    );
  }
);
FeatureCard.displayName = 'FeatureCard';

export { FeatureCard }; 