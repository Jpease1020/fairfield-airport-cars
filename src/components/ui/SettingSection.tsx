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
    <Card className="setting-section">
      <CardHeader className="setting-section-header">
        <div className="setting-section-content">
          <div className="setting-section-title-row">
            {icon && (
              <span className="setting-section-icon">
                {icon}
              </span>
            )}
            <h3 className="setting-section-title">
              {title}
            </h3>
          </div>
          {description && (
            <p className="setting-section-description">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="setting-section-actions">
            {actions}
          </div>
        )}
      </CardHeader>
      
      <CardBody className="setting-section-body">
        {children}
      </CardBody>
    </Card>
  );
}; 