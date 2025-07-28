import React from 'react';
import { Container, H3, Text, Span, Link } from '@/components/ui';
import { Stack } from '@/components/ui/containers';
import { EditableText } from '@/components/ui';

// StatCard Component - BULLETPROOF TYPE SAFETY!
interface StatCardProps {
  title: string | React.ReactNode;
  icon: string;
  statNumber: string | number;
  statChange?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string | React.ReactNode;
  href?: string;
  variant?: 'default' | 'highlighted' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  icon,
  statNumber,
  statChange,
  description,
  href,
}) => {
  const cardContent = (
    <>
      <Stack direction="horizontal" justify="between" align="center">
        <H3>
          {typeof title === 'string' ? (
            <EditableText field="statcard.title" defaultValue={title}>
              {title}
            </EditableText>
          ) : (
            title
          )}
        </H3>
        <Span>{icon}</Span>
      </Stack>
      <Stack>
        <Span>{statNumber}</Span>
        {statChange && (
          <Text>{statChange}</Text>
        )}
        {description && (
          <Text>
            {typeof description === 'string' ? (
              <EditableText field="statcard.description" defaultValue={description}>
                {description}
              </EditableText>
            ) : (
              description
            )}
          </Text>
        )}
      </Stack>
    </>
  );

  if (href) {
    return (
      <Link href={href}>
        <Container>
          {cardContent}
        </Container>
      </Link>
    );
  }

  return (
    <Container>
      {cardContent}
    </Container>
  );
}; 