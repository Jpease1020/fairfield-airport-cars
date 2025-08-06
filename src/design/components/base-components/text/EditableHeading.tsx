'use client';

import React from 'react';
import { Heading, HeadingProps } from './Heading';
import { useEditMode } from '../../../providers/EditModeProvider';

export interface EditableHeadingProps extends Omit<HeadingProps, 'children'> {
  field: string;
  children?: React.ReactNode;
  defaultValue?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  onFieldChange?: (field: string, value: string) => void;
}

export const EditableHeading: React.FC<EditableHeadingProps> = ({
  field,
  children,
  defaultValue = '',
  level = 2,
  onFieldChange,
  ...headingProps
}) => {
  // Check if we're in an admin context with edit mode
  const isAdminContext = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  
  // Only try to use edit mode in admin context
  let editMode = false;
  let localContent: any = null;
  let handleFieldChange: any = null;

  if (isAdminContext) {
    try {
      const editModeHook = useEditMode();
      editMode = editModeHook.editMode;
      localContent = editModeHook.localContent;
      handleFieldChange = editModeHook.handleFieldChange;
    } catch (error) {
      // Edit mode not available - fallback to display mode
      editMode = false;
    }
  }

  // Get value from props or fallback
  const getValue = (): string => {
    // First priority: Database value (passed from parent)
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

  // Handle field change
  const handleFieldChangeWrapper = (newValue: string) => {
    if (handleFieldChange) {
      const fieldParts = field.split('.');
      handleFieldChange(fieldParts[0], fieldParts[1] || field, newValue);
    }
    if (onFieldChange) {
      onFieldChange(field, newValue);
    }
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newValue = e.currentTarget.textContent || '';
    if (newValue !== currentValue) {
      handleFieldChangeWrapper(newValue);
    }
  };

  // Map level to heading element
  const getHeadingElement = (level: number): 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' => {
    return `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  };

  if (editMode) {
    return (
      <Heading
        {...headingProps}
        as={getHeadingElement(level)}
        contentEditable
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        onFocus={(e: React.FocusEvent<HTMLDivElement>) => {
          handleBlur(e);
        }}
      >
        {currentValue}
      </Heading>
    );
  }

  return (
    <Heading {...headingProps} as={getHeadingElement(level)}>
      {currentValue}
    </Heading>
  );
}; 