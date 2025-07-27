import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils/utils';

interface EditableTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rows?: number;
}

const EditableTextarea = React.forwardRef<HTMLTextAreaElement, EditableTextareaProps>(
  ({ className, label, size = 'md', rows = 3, ...props }, ref) => {
    const sizeClasses = {
      sm: 'text-sm min-h-[80px]',
      md: 'text-base min-h-[100px]',
      lg: 'text-lg min-h-[120px]',
      xl: 'text-xl min-h-[140px]'
    };

    return (
      <div >
        {label && (
          <label >
            {label}
          </label>
        )}
        <Textarea
          ref={ref}
          className={cn(
            'editable-textarea w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg p-4',
            sizeClasses[size],
            className
          )}
          rows={rows}
          {...props}
        />
      </div>
    );
  }
);

EditableTextarea.displayName = 'EditableTextarea';

export { EditableTextarea }; 