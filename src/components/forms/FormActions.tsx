import * as React from 'react';
import { cn } from '@/lib/utils/utils';

// FormActions Component - BULLETPROOF TYPE SAFETY!
interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  spacing?: 'sm' | 'md' | 'lg';
}

const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(
  ({ className, children, align = 'right', spacing = 'md', ...props }, ref) => {
    const alignClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    };

    const spacingClasses = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          alignClasses[align],
          spacingClasses[spacing],
          'pt-4 border-t border-border-primary',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
FormActions.displayName = 'FormActions';

export { FormActions }; 