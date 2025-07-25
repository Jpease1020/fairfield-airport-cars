import React from 'react';

interface InfoCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  theme?: 'light' | 'dark';
  variant?: 'default' | 'outlined' | 'elevated';
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  children,
  className = '',
  theme = 'light',
  variant = 'default'
}) => {
  const cardClass = [
    'card',
    variant === 'outlined' ? 'card-outlined' : '',
    variant === 'elevated' ? 'card-elevated' : '',
    theme === 'dark' ? 'dark-theme' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass}>
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        {description && <p className="card-description">{description}</p>}
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}; 