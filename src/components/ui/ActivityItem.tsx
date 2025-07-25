import React from 'react';

interface ActivityItemProps {
  icon: string;
  iconType?: 'success' | 'pending' | 'warning' | 'error' | 'info';
  title: string;
  subtitle?: string;
  amount?: string | number;
  href?: string;
  onClick?: () => void;
  className?: string;
  theme?: 'light' | 'dark';
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  icon,
  iconType = 'info',
  title,
  subtitle,
  amount,
  href,
  onClick,
  className = '',
  theme = 'light'
}) => {
  const itemClass = [
    'activity-item',
    theme === 'dark' ? 'dark-theme' : '',
    (href || onClick) ? 'activity-item-clickable' : '',
    className
  ].filter(Boolean).join(' ');

  const content = (
    <>
      <div className={`activity-icon ${iconType}`}>
        {icon}
      </div>
      <div className="activity-content">
        <p className="activity-title">{title}</p>
        {subtitle && <p className="activity-time">{subtitle}</p>}
      </div>
      {amount && (
        <div className="activity-amount">{amount}</div>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={itemClass}>
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={itemClass}>
        {content}
      </button>
    );
  }

  return (
    <div className={itemClass}>
      {content}
    </div>
  );
}; 