import React from 'react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui';

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  icon,
  children,
  className = ''
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {icon && <span>{icon}</span>}
          <span>{title}</span>
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