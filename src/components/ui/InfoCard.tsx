import React from 'react';

interface InfoCardProps {
  title: string;
  description?: string;
  subtitle?: string; // Alias for description
  icon?: string;     // Icon support
  children: React.ReactNode;
  className?: string;
  theme?: 'light' | 'dark';
  variant?: 'default' | 'outlined' | 'elevated';
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  subtitle,
  icon,
  children,
  className = '',
  theme = 'light',
  variant = 'default'
}) => {
  const cardClass = [
    'info-card',
    `info-card-${variant}`,
    theme === 'dark' ? 'info-card-dark' : 'info-card-light',
    className
  ].filter(Boolean).join(' ');

  // Use subtitle as fallback for description
  const cardDescription = description || subtitle;

  return (
    <div className={cardClass}>
      <div className="info-card-header">
        <h3 className="info-card-title">
          {icon && (
            <span className="info-card-icon">
              {icon}
            </span>
          )}
          {title}
        </h3>
        {cardDescription && (
          <p className="info-card-description">
            {cardDescription}
          </p>
        )}
      </div>
      <div className="info-card-body">
        {children}
      </div>
    </div>
  );
}; 