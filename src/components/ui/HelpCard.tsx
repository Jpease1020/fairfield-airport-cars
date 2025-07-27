import React from 'react';
import { Card, CardBody } from './card';
import { Stack, Span, Text } from '@/components/ui';

// HelpCard Component - BULLETPROOF TYPE SAFETY!
export interface HelpCardProps {
  icon: string;
  title: string;
  description: string;
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
            <Text>{title}</Text>
          </Stack>
          <Text>{description}</Text>
        </Stack>
      </CardBody>
    </Card>
  );
}; 