import React from 'react';
import { AlertItem } from './AlertItem';

interface AlertData {
  id: string | number;
  icon: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  href?: string;
  onClick?: () => void;
  onDismiss?: () => void;
}

interface AlertListProps {
  alerts: AlertData[];
  className?: string;
  theme?: 'light' | 'dark';
  emptyMessage?: string;
}

export const AlertList: React.FC<AlertListProps> = ({
  alerts,
  className = '',
  theme = 'light',
  emptyMessage = 'No alerts to display'
}) => {
  const listClass = [
    'alert-list',
    theme === 'dark' ? 'dark-theme' : '',
    className
  ].filter(Boolean).join(' ');

  if (alerts.length === 0) {
    return (
      <div className={listClass}>
        <div className="empty-state">
          <span className="empty-state-icon">🔔</span>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={listClass}>
      {alerts.map((alert) => (
        <AlertItem
          key={alert.id}
          icon={alert.icon}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          href={alert.href}
          onClick={alert.onClick}
          onDismiss={alert.onDismiss}
          theme={theme}
        />
      ))}
    </div>
  );
}; 