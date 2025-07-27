'use client';

import React from 'react';
import { Text, Container } from '@/components/ui';
import { useEditMode } from '@/components/admin/EditModeProvider';

interface EditableTextProps {
  field: string; // Database field path (e.g., "commentWidget.title")
  children?: React.ReactNode; // Fallback content (existing text)
  defaultValue?: string; // Default text if no database value
  variant?: 'body' | 'lead' | 'small' | 'muted' | 'strong' | 'em' | 'code' | 'mark';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';
}

export const EditableText: React.FC<EditableTextProps> = ({
  field,
  children,
  defaultValue = '',
  variant = 'body',
  size = 'base',
  align = 'left',
  color = 'primary'
}) => {
  const { editMode, localContent, handleFieldChange } = useEditMode();

  // Get value from database or use fallback
  const getValue = (): string => {
    // First priority: Database value
    if (localContent && localContent[field]) {
      return localContent[field];
    }
    // Second priority: Children as string
    if (children && typeof children === 'string') {
      return children;
    }
    // Third priority: Default value
    return defaultValue;
  };

  const currentValue = getValue();

  if (editMode) {
    return (
      <Container>
        <div
          contentEditable
          suppressContentEditableWarning
          style={{
            color: 'var(--text-primary)',
            fontSize: size === 'sm' ? 'var(--font-size-sm)' : 'var(--font-size-base)',
            textAlign: align,
            padding: '4px',
            border: '1px dashed #ccc',
            borderRadius: '4px',
            minHeight: '1em'
          }}
          onBlur={(e: React.FocusEvent<HTMLDivElement>) => {
            const newValue = e.currentTarget.textContent || '';
            const fieldParts = field.split('.');
            handleFieldChange(fieldParts[0], fieldParts[1] || field, newValue);
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        >
          {currentValue}
        </div>
      </Container>
    );
  }

  // Display mode - show database value or fallback to children
  return (
    <Text
      variant={variant}
      size={size}
      align={align}
      color={color}
    >
      {currentValue}
    </Text>
  );
}; 