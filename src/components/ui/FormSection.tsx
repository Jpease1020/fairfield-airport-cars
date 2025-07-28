import React from 'react';
import { Card } from '@/components/ui/containers';
import { CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Text, Span } from '@/components/ui';

interface FormSectionProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  icon?: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  icon,
  children
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {icon && <Span>{icon}</Span>}
          <Span>{title}</Span>
        </CardTitle>
        {description && (
          <Text>{description}</Text>
        )}
      </CardHeader>
      <CardBody>
        {children}
      </CardBody>
    </Card>
  );
}; 