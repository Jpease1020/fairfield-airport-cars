'use client';

import React from 'react';
import { Button, Container } from '@/components/ui';
import { useEditMode } from '@/components/admin/EditModeProvider';

interface EditableButtonProps {
  field: string; // Database field path (e.g., "hero.ctaText")
  children?: React.ReactNode; // Fallback content (existing text)
  defaultValue?: string; // Default text if no database value
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  icon?: string;
}

export const EditableButton: React.FC<EditableButtonProps> = ({
  field,
  children,
  defaultValue = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  icon
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
            fontSize: size === 'sm' ? 'var(--font-size-sm)' : 
                     size === 'lg' ? 'var(--font-size-lg)' : 'var(--font-size-base)',
            textAlign: 'center',
            padding: '8px 16px',
            border: '1px dashed #ccc',
            borderRadius: '6px',
            minHeight: '1em',
            backgroundColor: variant === 'primary' ? 'var(--color-primary)' : 'transparent',
            color: variant === 'primary' ? 'white' : 'var(--text-primary)',
            cursor: 'text'
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
          {icon && <span style={{ marginRight: '4px' }}>{icon}</span>}
          {currentValue}
        </div>
      </Container>
    );
  }

  // Display mode - show database value or fallback to children
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <span style={{ marginRight: '4px' }}>{icon}</span>}
      {currentValue}
    </Button>
  );
}; 