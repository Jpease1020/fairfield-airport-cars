import * as React from 'react';
import { Stack } from '@/components/ui/containers';

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
  const containerClasses = [
    'flex items-center pt-4',
    align === 'left' ? 'justify-start' : align === 'center' ? 'justify-center' : 'justify-end',
    variant === 'bordered' ? 'border-t border-border-primary' : '',
    variant === 'elevated' ? 'shadow-sm' : ''
  ].filter(Boolean).join(' ');

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4', 
    lg: 'gap-6',
  };

  return (
    <div className={`${containerClasses} ${gapClasses[spacing]}`}>
      {children}
    </div>
  );
};

FormActions.displayName = 'FormActions';

export { FormActions }; 