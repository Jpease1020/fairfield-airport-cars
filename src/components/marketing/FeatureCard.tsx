import * as React from 'react';
import { cn } from '@/lib/utils/utils';
import { Container, H3, Text, Span } from '@/components/ui';

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
          <Container>
            {icon}
          </Container>
        )}
        
        <H3>
          {title}
        </H3>
        
        <Text>
          {description}
        </Text>
        
        {href && (
          <Container>
            <Span>Learn more</Span>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Container>
        )}
      </>
    );

    if (href) {
      return (
        <a href={href} className={className}>
          {content}
        </a>
      );
    }

    return (
      <Container className={className} {...props}>
        {content}
      </Container>
    );
  }
);
FeatureCard.displayName = 'FeatureCard';

export { FeatureCard }; 