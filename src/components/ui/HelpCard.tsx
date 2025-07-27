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
    <Card className={`help-card ${className}`}>
      <CardBody className="help-card-body">
        <div className="help-card-header">
          <span className="help-card-icon">
            {icon}
          </span>
          <strong className="help-card-title">
            {title}
          </strong>
        </div>
        <p className="help-card-description">
          {description}
        </p>
      </CardBody>
    </Card>
  );
}; 