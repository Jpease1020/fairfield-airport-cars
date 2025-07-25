import React from 'react';

interface ActionCardProps {
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
  description?: string;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  theme?: 'light' | 'dark';
  disabled?: boolean;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  label,
  href,
  onClick,
  description,
  variant = 'default',
  size = 'md',
  className = '',
  theme = 'light',
  disabled = false
}) => {
  const cardClass = [
    'action-card',
    `action-card-${size}`,
    variant !== 'default' ? `action-card-${variant}` : '',
    theme === 'dark' ? 'dark-theme' : '',
    disabled ? 'action-card-disabled' : '',
    className
  ].filter(Boolean).join(' ');

  const content = (
    <>
      <div className="action-icon">
        {icon}
      </div>
      <span className="action-label">{label}</span>
      {description && (
        <p className="action-description">{description}</p>
      )}
    </>
  );

  if (disabled) {
    return (
      <div className={cardClass}>
        {content}
      </div>
    );
  }

  if (href) {
    return (
      <a href={href} className={cardClass}>
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={cardClass}>
        {content}
      </button>
    );
  }

  return (
    <div className={cardClass}>
      {content}
    </div>
  );
}; 