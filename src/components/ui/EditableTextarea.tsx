import React from 'react';
import { Container, Label } from '@/components/ui';
import { cn } from '@/lib/utils/utils';

// EditableTextarea Component - BULLETPROOF TYPE SAFETY!
interface EditableTextareaProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rows?: number;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  spacing?: 'sm' | 'md' | 'lg';
}

const EditableTextarea: React.FC<EditableTextareaProps> = ({ 
    label, 
    size = 'md', 
    rows = 3, 
    value, 
    onChange, 
    placeholder, 
    disabled = false
  }) => {
    const sizeClasses = {
      sm: 'text-sm min-h-[80px]',
      md: 'text-base min-h-[100px]',
      lg: 'text-lg min-h-[120px]',
      xl: 'text-xl min-h-[140px]'
    };

    return (
      <Container>
        {label && (
          <Label>
            {label}
          </Label>
        )}
        <textarea
          className={cn(
            'editable-textarea w-full mb-2 border-2 border-border-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary rounded-lg p-4',
            sizeClasses[size]
          )}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      </Container>
    );
  };

EditableTextarea.displayName = 'EditableTextarea';

export { EditableTextarea }; 