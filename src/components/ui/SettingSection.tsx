import React from 'react';

export interface SettingSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const SettingSection: React.FC<SettingSectionProps> = ({
  title,
  description,
  icon,
  children,
  actions
}) => {
  return (
    <div className="card" style={{
      backgroundColor: 'var(--background-primary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--border-radius)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--spacing-lg)',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--background-secondary)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              marginBottom: description ? 'var(--spacing-xs)' : 0
            }}>
              {icon && (
                <span style={{ fontSize: 'var(--font-size-lg)' }}>
                  {icon}
                </span>
              )}
              <h3 style={{
                margin: 0,
                fontSize: 'var(--font-size-lg)',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                {title}
              </h3>
            </div>
            {description && (
              <p style={{
                margin: 0,
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-secondary)'
              }}>
                {description}
              </p>
            )}
          </div>
          
          {actions && (
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              {actions}
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div style={{
        padding: 'var(--spacing-lg)'
      }}>
        {children}
      </div>
    </div>
  );
}; 