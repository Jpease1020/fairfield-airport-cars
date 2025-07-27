import React from 'react';
import { Button } from './button';
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
      <div className={`status-message status-message-${type}`}>
        <div >
          <span >{icon || getDefaultIcon()}</span>
          <span >{message}</span>
        </div>
        
        {onDismiss && (
          <Button
            onClick={onDismiss}
            variant="ghost"
            size="sm"
            
          >
            ×
          </Button>
        )}
      </div>
    </GridSection>
  );
}; 