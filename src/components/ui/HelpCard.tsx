import React from 'react';
import { Card, CardBody } from './card';
import { Stack, Span, Text } from '@/components/ui';
import { EditableText } from '@/components/ui';

// HelpCard Component - BULLETPROOF TYPE SAFETY!
export interface HelpCardProps {
  icon: string;
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  variant?: 'default' | 'highlighted' | 'compact';
  size?: 'sm' | 'md' | 'lg';
}

export const HelpCard: React.FC<HelpCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <Card>
      <CardBody>
        <Stack spacing="sm">
          <Stack direction="horizontal" spacing="sm" align="center">
            <Span>
              {icon}
            </Span>
            {typeof title === 'string' ? (
              <EditableText field="helpcard.title" defaultValue={title}>
                {title}
              </EditableText>
            ) : (
              title
            )}
          </Stack>
          {typeof description === 'string' ? (
            <EditableText field="helpcard.description" defaultValue={description}>
              {description}
            </EditableText>
          ) : (
            description
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}; 