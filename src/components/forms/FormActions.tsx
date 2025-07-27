import * as React from 'react';
import { Stack, Container } from '@/components/ui/containers';

// FormActions Component - BULLETPROOF TYPE SAFETY!
interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  spacing?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered' | 'elevated';
}

const FormActions: React.FC<FormActionsProps> = ({ 
  children, 
  align = 'right', 
  spacing = 'md',
  variant = 'bordered'
}) => {
  return (
    <Container 
      variant={variant === 'elevated' ? 'elevated' : 'default'}
      padding="md"
      margin="none"
    >
      <Stack 
        direction="horizontal" 
        spacing={spacing}
        align="center"
        justify={align === 'left' ? 'start' : align === 'center' ? 'center' : 'end'}
      >
        {children}
      </Stack>
    </Container>
  );
};

FormActions.displayName = 'FormActions';

export { FormActions }; 