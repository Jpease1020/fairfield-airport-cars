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
    'card',
    variant === 'outlined' ? 'card-outlined' : '',
    variant === 'elevated' ? 'card-elevated' : '',
    theme === 'dark' ? 'dark-theme' : '',
    className
  ].filter(Boolean).join(' ');

  // Use subtitle as fallback for description
  const cardDescription = description || subtitle;

  return (
    <div className={cardClass}>
      <div className="card-header">
        <h3 className="card-title" style={{
          display: 'flex',
          alignItems: 'center',
          gap: icon ? 'var(--spacing-sm)' : '0'
        }}>
          {icon && (
            <span className="card-icon" style={{ fontSize: 'var(--font-size-lg)' }}>
              {icon}
            </span>
          )}
          {title}
        </h3>
        {cardDescription && (
          <p className="card-description" style={{
            margin: 'var(--spacing-xs) 0 0 0',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)'
          }}>
            {cardDescription}
          </p>
        )}
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}; 