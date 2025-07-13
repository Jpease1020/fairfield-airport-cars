import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(
  ({ 
    className, 
    children, 
    submitText = 'Submit', 
    cancelText = 'Cancel',
    onSubmit,
    onCancel,
    loading = false,
    disabled = false,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-end space-x-3 pt-6', className)}
        {...props}
      >
        {children}
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
        )}
        {onSubmit && (
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={disabled || loading}
          >
            {loading ? 'Loading...' : submitText}
          </Button>
        )}
      </div>
    );
  }
);
FormActions.displayName = 'FormActions';

export { FormActions }; 