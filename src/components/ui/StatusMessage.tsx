import React from 'react';
import { GridSection } from './GridSection';

export interface StatusMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  icon?: string;
  onDismiss?: () => void;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  type,
  message,
  icon,
  onDismiss
}) => {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#dcfce7',
          color: '#166534',
          border: '1px solid #4ade80'
        };
      case 'error':
        return {
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #f87171'
        };
      case 'warning':
        return {
          backgroundColor: '#fef3c7',
          color: '#92400e',
          border: '1px solid #fcd34d'
        };
      case 'info':
        return {
          backgroundColor: '#dbeafe',
          color: '#1e40af',
          border: '1px solid #60a5fa'
        };
      default:
        return {
          backgroundColor: '#f3f4f6',
          color: '#374151',
          border: '1px solid #d1d5db'
        };
    }
  };

  const getDefaultIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '';
    }
  };

  return (
    <GridSection variant="content" columns={1}>
      <div style={{
        ...getStyles(),
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--border-radius)',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--spacing-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <span>{icon || getDefaultIcon()}</span>
          <span>{message}</span>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: 'var(--font-size-lg)',
              padding: 'var(--spacing-xs)',
              opacity: 0.7
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
          >
            ×
          </button>
        )}
      </div>
    </GridSection>
  );
}; 