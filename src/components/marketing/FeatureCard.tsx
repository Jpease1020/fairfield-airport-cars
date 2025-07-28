import * as React from 'react';
import { Container, H3, Text, Span, Link, EditableText } from '@/components/ui';

interface FeatureCardProps {
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'card' | 'section' | 'main' | 'content' | 'navigation' | 'tooltip' | 'elevated';
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
  padding = 'lg'
}) => {
  const content = (
    <Container variant={variant} padding={padding}>
      {icon && (
        <Container>
          {icon}
        </Container>
      )}
      
      <H3>
        {typeof title === 'string' ? (
          <EditableText field="featurecard.title" defaultValue={title}>
            {title}
          </EditableText>
        ) : (
          title
        )}
      </H3>
      
      <Text>
        {typeof description === 'string' ? (
          <EditableText field="featurecard.description" defaultValue={description}>
            {description}
          </EditableText>
        ) : (
          description
        )}
      </Text>
      
      {href && (
        <Container>
          <Span>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Span>
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