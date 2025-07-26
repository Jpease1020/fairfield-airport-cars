import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

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
        <CardTitle className="">
          {icon && <span className="">{icon}</span>}
          <span>{title}</span>
        </CardTitle>
        {description && (
          <p className="">{description}</p>
        )}
      </CardHeader>
      <CardContent className="">
        {children}
      </CardContent>
    </Card>
  );
}; 