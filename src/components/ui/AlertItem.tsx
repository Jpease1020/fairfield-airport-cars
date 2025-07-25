import React from 'react';

interface AlertItemProps {
  icon: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  href?: string;
  onClick?: () => void;
  onDismiss?: () => void;
  className?: string;
  theme?: 'light' | 'dark';
}

export const AlertItem: React.FC<AlertItemProps> = ({
  icon,
  type = 'info',
  title,
  message,
  href,
  onClick,
  onDismiss,
  className = '',
  theme = 'light'
}) => {
  const itemClass = [
    'alert-item',
    type,
    theme === 'dark' ? 'dark-theme' : '',
    (href || onClick) ? 'alert-item-clickable' : '',
    className
  ].filter(Boolean).join(' ');

  const content = (
    <>
      <div className="alert-icon">
        {icon}
      </div>
      <div className="alert-content">
        <p className="alert-title">{title}</p>
        <p className="alert-message">{message}</p>
      </div>
      {onDismiss && (
        <button 
          className="alert-dismiss"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDismiss();
          }}
          aria-label="Dismiss alert"
        >
          ✕
        </button>
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