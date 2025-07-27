import React from 'react';

export interface PageAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: PageAction[];
  className?: string;
  theme?: 'light' | 'dark';
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions = [],
  className = '',
  theme = 'light'
}) => {
  const renderAction = (action: PageAction, index: number) => {
    const baseClass = `btn ${action.variant === 'primary' ? 'btn-primary' : action.variant === 'secondary' ? 'btn-secondary' : 'btn-outline'}`;
    const actionClass = `${baseClass} ${action.className || ''}`.trim();

    if (action.href) {
      return (
        <a 
          key={index}
          href={action.href} 
          className={actionClass}
        >
          {action.label}
        </a>
      );
    }

    return (
      <button
        key={index}
        onClick={action.onClick}
        className={actionClass}
      >
        {action.label}
      </button>
    );
  };

  return (
    <div className={`section-header ${theme === 'dark' ? 'dark-theme' : ''} ${className}`.trim()}>
      <h1 >{title}</h1>
      {subtitle && <p >{subtitle}</p>}
      {actions.length > 0 && (
        <div >
          {actions.map(renderAction)}
        </div>
      )}
    </div>
  );
}; 