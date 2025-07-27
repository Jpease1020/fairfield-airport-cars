import React from 'react';
import { Card, CardBody } from './card';

export interface HelpCardProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

export const HelpCard: React.FC<HelpCardProps> = ({
  icon,
  title,
  description,
  className = ''
}) => {
  return (
    <Card>
      <Stack spacing="sm">
        <Stack direction="horizontal" spacing="sm" align="center">
          <Span>
            {icon}
          </Span>
          <Text>{title}</Text>
        </Stack>
        <Text>{description}</Text>
      </Stack>
    </Card>
  );
}; 