import React from 'react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {icon && <span>{icon}</span>}
          <span>{title}</span>
        </CardTitle>
        {description && (
          <p className="mt-1">{description}</p>
        )}
      </CardHeader>
      <CardBody className="space-y-4">
        {children}
      </CardBody>
    </Card>
  );
}; 