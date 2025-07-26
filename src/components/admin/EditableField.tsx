'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
      <div className="mb-4">
        {label && (
          <label className="">
            {label}
          </label>
        )}
        {type === 'textarea' ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`editable-textarea w-full ${sizeClasses[size]} ${className}`}
            rows={rows}
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`editable-input w-full ${sizeClasses[size]} ${inputSizeClasses[size]} ${className}`}
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
          className={`${sizeClasses[size]} ${className}`}
          dangerouslySetInnerHTML={{ __html: value || placeholder || '' }}
        />
      );
    }
    
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        {value || placeholder}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      {value || placeholder}
    </div>
  );
};

// Specialized components for common use cases
export const EditableTitle: React.FC<Omit<EditableFieldProps, 'type' | 'size'>> = (props) => (
  <EditableField {...props} type="input" size="xl" className="" />
);

export const EditableSubtitle: React.FC<Omit<EditableFieldProps, 'type' | 'size'>> = (props) => (
  <EditableField {...props} type="input" size="lg" className="" />
);

export const EditableContent: React.FC<Omit<EditableFieldProps, 'type' | 'size'> & { rows?: number }> = (props) => (
  <EditableField {...props} type="textarea" size="md" className="" />
);

export const EditableLabel: React.FC<Omit<EditableFieldProps, 'type' | 'size'>> = (props) => (
  <EditableField {...props} type="input" size="md" className="" />
); 