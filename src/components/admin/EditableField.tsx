'use client';

import React from 'react';
import { Input, Label } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { useEditMode } from './EditModeProvider';

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  type?: 'input' | 'textarea';
  rows?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const EditableField: React.FC<EditableFieldProps> = ({
  value,
  onChange,
  label,
  placeholder,
  className = '',
  type = 'input',
  rows = 3,
  size = 'md'
}) => {
  const { editMode } = useEditMode();

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const inputSizeClasses = {
    sm: 'h-8 px-3',
    md: 'h-10 px-4',
    lg: 'h-12 px-4',
    xl: 'h-14 px-4'
  };

  if (editMode) {
    return (
      <div>
        {label && (
          <Label>
            {label}
          </Label>
        )}
        {type === 'textarea' ? (
          <Textarea
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
            placeholder={placeholder}
            className={className}
            rows={rows}
          />
        ) : (
          <Input
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            placeholder={placeholder}
            className={className}
          />
        )}
      </div>
    );
  }

  // Display mode
  if (type === 'textarea') {
    // Check if the content contains HTML tags
    const containsHTML = /<[^>]*>/.test(value);
    
    if (containsHTML) {
      return (
        <div 
          className={className}
          dangerouslySetInnerHTML={{ __html: value || placeholder || '' }}
        />
      );
    }
    
    return (
      <div className={className}>
        {value || placeholder}
      </div>
    );
  }

  return (
    <div className={className}>
      {value || placeholder}
    </div>
  );
};

// Specialized components for common use cases
export const EditableTitle: React.FC<Omit<EditableFieldProps, 'type' | 'size'>> = (props) => (
  <EditableField {...props} type="input" size="xl" />
);

export const EditableSubtitle: React.FC<Omit<EditableFieldProps, 'type' | 'size'>> = (props) => (
  <EditableField {...props} type="input" size="lg" />
);

export const EditableContent: React.FC<Omit<EditableFieldProps, 'type' | 'size'> & { rows?: number }> = (props) => (
  <EditableField {...props} type="textarea" size="md" />
);

export const EditableLabel: React.FC<Omit<EditableFieldProps, 'type' | 'size'>> = (props) => (
  <EditableField {...props} type="input" size="md" />
); 