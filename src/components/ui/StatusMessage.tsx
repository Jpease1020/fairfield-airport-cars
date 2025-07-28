import React from 'react';
import { Button } from './button';
import { GridSection } from './GridSection';
import { Container, Span } from '@/components/ui';
import { Stack } from '@/components/ui/containers';
import { EditableText } from '@/components/ui';

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
      <Container>
        <Stack direction="horizontal" spacing="sm" align="center">
          <Span>{icon || getDefaultIcon()}</Span>
          <EditableText field="statusmessage.message" defaultValue={message}>
            {message}
          </EditableText>
        </Stack>
        
        {onDismiss && (
          <Button
            onClick={onDismiss}
            variant="ghost"
            size="sm"
          >
            ×
          </Button>
        )}
      </Container>
    </GridSection>
  );
}; 