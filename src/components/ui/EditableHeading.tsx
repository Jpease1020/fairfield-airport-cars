'use client';

import React from 'react';
import { H1, H2, H3, H4, H5, H6, Container } from '@/components/ui';
import { useEditMode } from '@/components/admin/EditModeProvider';

interface EditableHeadingProps {
  field: string; // Database field path (e.g., "hero.title")
  children?: React.ReactNode; // Fallback content (existing text)
  defaultValue?: string; // Default text if no database value
  level?: 1 | 2 | 3 | 4 | 5 | 6; // Heading level
  align?: 'left' | 'center' | 'right';
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';
}

export const EditableHeading: React.FC<EditableHeadingProps> = ({
  field,
  children,
  defaultValue = '',
  level = 2,
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
            fontSize: level === 1 ? 'var(--font-size-2xl)' : 
                     level === 2 ? 'var(--font-size-xl)' :
                     level === 3 ? 'var(--font-size-lg)' :
                     level === 4 ? 'var(--font-size-base)' :
                     level === 5 ? 'var(--font-size-sm)' : 'var(--font-size-xs)',
            fontWeight: 'bold',
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
  const HeadingComponent = level === 1 ? H1 : 
                          level === 2 ? H2 : 
                          level === 3 ? H3 : 
                          level === 4 ? H4 : 
                          level === 5 ? H5 : H6;

  return (
    <HeadingComponent
      align={align}
    >
      {currentValue}
    </HeadingComponent>
  );
}; 