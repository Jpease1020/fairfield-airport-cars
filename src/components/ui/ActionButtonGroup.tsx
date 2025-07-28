import React from 'react';
import { Button, Span } from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';

export interface ActionButton {
  label: string | React.ReactNode;
  onClick: () => void;
  variant: 'primary' | 'outline' | 'secondary'; // Made required to ensure explicit variant choice
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: string;
}

export interface ActionButtonGroupProps {
  buttons: ActionButton[];
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'xs' | 'sm' | 'md' | 'lg';
}

export const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  buttons,
  orientation = 'horizontal',
  spacing = 'md' // Changed from 'xs' to 'md' for better spacing
}) => {
  return (
    <Stack 
      direction={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
      spacing={spacing}
      align="center"
    >
      {buttons.map((button, index) => (
        <Button
          key={index}
          variant={button.variant}
          size={button.size || 'sm'}
          onClick={button.onClick}
          disabled={button.disabled}
        >
          {button.icon && (
            <Span>
              {button.icon}
            </Span>
          )}
          <Span>
            {button.label}
          </Span>
        </Button>
      ))}
    </Stack>
  );
}; 