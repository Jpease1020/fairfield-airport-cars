import * as React from 'react';
import { Container, H3, Text, Span, Link } from '@/components/ui';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'highlighted' | 'minimal';
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon,
  variant = 'default',
  href,
  size = 'md',
  padding = 'lg'
}) => {
  const content = (
    <Container variant={variant} size={size} padding={padding}>
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
    </Container>
  );

  if (href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    );
  }

  return content;
};
FeatureCard.displayName = 'FeatureCard';

export { FeatureCard }; 