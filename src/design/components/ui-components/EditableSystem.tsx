'use client';

import React from 'react';
import { Button } from '@/ui';
import { H1, H2, H3, H4, H5, H6, Text } from '@/ui';
import { Stack } from '../grid-structural-components';
import { useEditMode } from '../../providers/EditModeProvider';
import { getContent } from '@/lib/content/content-mapping';

// Unified Editable Component
export interface EditableProps {
  field: string;
  children?: React.ReactNode;
  defaultValue?: string;
  type?: 'text' | 'heading' | 'button';
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';
  disabled?: boolean;
  onClick?: () => void;
  icon?: string;
  id?: string;
  [key: string]: any;
}

export const Editable: React.FC<EditableProps> = ({
  field,
  children,
  defaultValue = '',
  type = 'text',
  level = 2,
  variant = 'primary',
  size = 'md',
  align = 'left',
  color = 'primary',
  disabled = false,
  onClick,
  icon,
  id,
  ...rest
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

  // Get value from database or use fallback
  const getValue = (): string => {
    // First priority: Database value
    if (localContent && localContent[field]) {
      return localContent[field];
    }
    // Second priority: Content mapping (preserves existing content)
    const mappedContent = getContent(field);
    if (mappedContent) {
      return mappedContent;
    }
    // Third priority: Children as string
    if (children && typeof children === 'string') {
      return children;
    }
    // Fourth priority: Default value
    return defaultValue;
  };

  const currentValue = getValue();

  // Handle field change
  const handleFieldChangeWrapper = (newValue: string) => {
    if (handleFieldChange) {
      const fieldParts = field.split('.');
      handleFieldChange(fieldParts[0], fieldParts[1] || field, newValue);
    }
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  // Handle blur events
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newValue = e.currentTarget.textContent || '';
    handleFieldChangeWrapper(newValue);
  };

  if (editMode && handleFieldChange) {
    // Edit mode - render editable div
    return (
      <Stack direction="horizontal" align="center" justify="center">
        <Text
          as="div"
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          id={id}
          {...rest}
        >
          {icon && <Stack direction="horizontal" align="center" spacing="xs">{icon}</Stack>}
          {currentValue}
        </Text>
      </Stack>
    );
  }

  // Display mode - render appropriate component
  if (type === 'button') {
    return (
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={onClick}
        id={id}
        {...rest}
      >
        {icon && <Stack direction="horizontal" align="center" spacing="xs">{icon}</Stack>}
        {currentValue}
      </Button>
    );
  }

  if (type === 'heading') {
    const HeadingComponent = level === 1 ? H1 : 
                            level === 2 ? H2 : 
                            level === 3 ? H3 : 
                            level === 4 ? H4 : 
                            level === 5 ? H5 : H6;

    return (
      <HeadingComponent
        align={align}
        id={id}
        {...rest}
      >
        {currentValue}
      </HeadingComponent>
    );
  }

  // Default text type
  return (
    <span id={id} {...rest}>
      {currentValue}
    </span>
  );
};

// Convenience components for backward compatibility
export const EditableText: React.FC<Omit<EditableProps, 'type'> & { field: string }> = (props) => (
  <Editable {...props} type="text" />
);

export const EditableHeading: React.FC<Omit<EditableProps, 'type'> & { field: string; level?: 1 | 2 | 3 | 4 | 5 | 6 }> = (props) => (
  <Editable {...props} type="heading" />
);

export const EditableButton: React.FC<Omit<EditableProps, 'type'> & { field: string; variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' }> = (props) => (
  <Editable {...props} type="button" />
); 