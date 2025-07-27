import React from 'react';
import { Button, Span } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

export interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'outline' | 'secondary';
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
  spacing = 'xs'
}) => {


  return (
    <Stack 
      direction={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
      spacing={spacing}
    >
      {buttons.map((button, index) => (
        <Button
          key={index}
          variant={button.variant || 'outline'}
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