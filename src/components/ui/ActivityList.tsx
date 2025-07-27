import React from 'react';
import { ActivityItem } from './ActivityItem';

interface ActivityData {
  id: string | number;
  icon: string;
  iconType?: 'success' | 'pending' | 'warning' | 'error' | 'info';
  title: string;
  subtitle?: string;
  amount?: string | number;
  href?: string;
  onClick?: () => void;
}

interface ActivityListProps {
  activities: ActivityData[];
  className?: string;
  theme?: 'light' | 'dark';
  emptyMessage?: string;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  className = '',
  theme = 'light',
  emptyMessage = 'No activities to display'
}) => {
  const listClass = [
    'activity-list',
    theme === 'dark' ? 'dark-theme' : '',
    className
  ].filter(Boolean).join(' ');

  if (activities.length === 0) {
    return (
      <div className={listClass}>
        <div >
          <span >📭</span>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={listClass}>
      {activities.map((activity) => (
        <ActivityItem
          key={activity.id}
          icon={activity.icon}
          iconType={activity.iconType}
          title={activity.title}
          subtitle={activity.subtitle}
          amount={activity.amount}
          href={activity.href}
          onClick={activity.onClick}
          theme={theme}
        />
      ))}
    </div>
  );
}; 