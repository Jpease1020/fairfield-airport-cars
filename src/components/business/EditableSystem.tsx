'use client';

import React from 'react';
import { Button } from '@/design/components/base-components/Button';
import { H1, H2, H3, H4, H5, H6 } from '@/design/components/base-components/text/Headings';
import { Text } from '@/design/components/base-components/text/Text';
import { Stack } from '@/design/layout/framing/Stack';

// Unified Editable Component
export interface EditableProps {
  field: string;
  children?: React.ReactNode;
  defaultValue?: string;
  isEditable?: boolean;
  value?: string;
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
  onFieldChange?: (field: string, value: string) => void;
  [key: string]: any;
}

export const Editable: React.FC<EditableProps> = ({
  field,
  children,
  defaultValue = '',
  isEditable = false,
  value,
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
  onFieldChange,
  ...rest
}) => {
  // Get value from props or fallback
  const getValue = (): string => {
    // First priority: Explicit value prop
    if (value !== undefined) {
      return value;
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

  // Handle blur events
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newValue = e.currentTarget.textContent || '';
    handleFieldChangeWrapper(newValue);
  };

  if (isEditable) {
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

// Convenience component for backward compatibility
export const EditableButton: React.FC<Omit<EditableProps, 'type'> & { field: string; variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' }> = (props) => (
  <Editable {...props} type="button" />
); 