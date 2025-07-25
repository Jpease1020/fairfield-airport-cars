import React from 'react';

interface StatCardProps {
  title: string;
  icon: string;
  statNumber: string | number;
  statChange?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
  href?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  icon,
  statNumber,
  statChange,
  changeType = 'neutral',
  description,
  href,
  className = ''
}) => {
  const cardContent = (
    <>
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        <span className="card-icon">{icon}</span>
      </div>
      <div className="card-body">
        <div className="stat-number">{statNumber}</div>
        {statChange && (
          <p className={`stat-change ${changeType}`}>{statChange}</p>
        )}
        {description && (
          <p className="card-description">{description}</p>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} className={`card ${className}`.trim()}>
        {cardContent}
      </a>
    );
  }

  return (
    <div className={`card ${className}`.trim()}>
      {cardContent}
    </div>
  );
}; 