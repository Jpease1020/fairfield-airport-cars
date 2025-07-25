import React from 'react';
import { ActionCard } from './ActionCard';

interface ActionData {
  id: string | number;
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
  description?: string;
  variant?: 'default' | 'outlined' | 'filled';
  disabled?: boolean;
}

interface ActionGridProps {
  actions: ActionData[];
  columns?: 2 | 3 | 4 | 6;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  theme?: 'light' | 'dark';
  emptyMessage?: string;
}

export const ActionGrid: React.FC<ActionGridProps> = ({
  actions,
  columns = 4,
  size = 'md',
  className = '',
  theme = 'light',
  emptyMessage = 'No actions available'
}) => {
  const gridClass = [
    'grid',
    `grid-${columns}`,
    theme === 'dark' ? 'dark-theme' : '',
    className
  ].filter(Boolean).join(' ');

  if (actions.length === 0) {
    return (
      <div className={gridClass}>
        <div className="empty-state">
          <span className="empty-state-icon">⚡</span>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {actions.map((action) => (
        <ActionCard
          key={action.id}
          icon={action.icon}
          label={action.label}
          href={action.href}
          onClick={action.onClick}
          description={action.description}
          variant={action.variant}
          size={size}
          theme={theme}
          disabled={action.disabled}
        />
      ))}
    </div>
  );
}; 