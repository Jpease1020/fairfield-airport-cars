'use client';

import React from 'react';
import { Input, Label, Container, Span } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { useEditMode } from './EditModeProvider';

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  type?: 'input' | 'textarea';
  rows?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const EditableField: React.FC<EditableFieldProps> = ({
  value,
  onChange,
  label,
  placeholder,
  type = 'input',
  rows = 3
}) => {
  const { editMode } = useEditMode();

  if (editMode) {
    return (
      <Container>
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
            rows={rows}
          />
        ) : (
          <Input
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        )}
      </Container>
    );
  }

  // Display mode
  if (type === 'textarea') {
    // Check if the content contains HTML tags
    const containsHTML = /<[^>]*>/.test(value);
    
    if (containsHTML) {
      return (
        <Container>
          <span dangerouslySetInnerHTML={{ __html: value || placeholder || '' }} />
        </Container>
      );
    }
    
    return (
      <Container>
        {value || placeholder}
      </Container>
    );
  }

  return (
    <Container>
      {value || placeholder}
    </Container>
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