import React from 'react';

export interface HelpCardProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

export const HelpCard: React.FC<HelpCardProps> = ({
  icon,
  title,
  description,
  className = ''
}) => {
  return (
    <div 
      className={className}
      style={{
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--background-secondary)',
        borderRadius: 'var(--border-radius)',
        border: '1px solid var(--border-color)'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-sm)'
      }}>
        <span style={{ fontSize: 'var(--font-size-lg)' }}>
          {icon}
        </span>
        <strong style={{ fontSize: 'var(--font-size-sm)' }}>
          {title}
        </strong>
      </div>
      <p style={{
        fontSize: 'var(--font-size-xs)',
        color: 'var(--text-secondary)',
        margin: 0,
        lineHeight: '1.4'
      }}>
        {description}
      </p>
    </div>
  );
}; 