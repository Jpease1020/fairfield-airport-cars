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
      <div>
        {icon}
      </div>
      <div>
        <p>{title}</p>
        <p>{message}</p>
      </div>
      {onDismiss && (
        <button 
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
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
}; 