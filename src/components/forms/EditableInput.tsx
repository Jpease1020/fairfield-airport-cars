import React from 'react';
import { Input } from '@/components/ui/input';
import { Container, Label } from '@/components/ui';
import { cn } from '@/lib/utils/utils';

interface EditableInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'title' | 'subtitle' | 'normal';
}

const EditableInput = React.forwardRef<HTMLInputElement, EditableInputProps>(
  ({ className, label, size = 'md', variant = 'normal', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 text-sm',
      md: 'h-10 text-base',
      lg: 'h-12 text-lg',
      xl: 'h-14 text-xl'
    };

    const variantClasses = {
      title: 'text-3xl font-bold',
      subtitle: 'text-xl font-semibold',
      normal: 'text-base'
    };

    return (
      <Container>
        {label && (
          <Label>
            {label}
          </Label>
        )}
        <input
          ref={ref}
          className={cn(
            'editable-input w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg px-4',
            sizeClasses[size],
            variantClasses[variant],
            className
          )}
          {...props}
        />
      </Container>
    );
  }
);

EditableInput.displayName = 'EditableInput';

export { EditableInput }; 