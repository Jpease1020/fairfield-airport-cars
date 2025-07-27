import React from 'react';
import { Card, CardHeader, CardBody } from './card';

export interface SettingSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const SettingSection: React.FC<SettingSectionProps> = ({
  title,
  description,
  icon,
  children,
  actions
}) => {
  return (
    <Card >
      <CardHeader >
        <div >
          <div >
            {icon && (
              <span >
                {icon}
              </span>
            )}
            <h3 >
              {title}
            </h3>
          </div>
          {description && (
            <p >
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div >
            {actions}
          </div>
        )}
      </CardHeader>
      
      <CardBody >
        {children}
      </CardBody>
    </Card>
  );
}; 