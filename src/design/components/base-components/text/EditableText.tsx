'use client';

import React from 'react';
import { Text, TextProps } from './Text';
import { ColorVariant } from '../../../system/shared-types';

export interface EditableTextProps extends Omit<TextProps, 'children'> {
  field: string;
  children?: React.ReactNode;
  defaultValue?: string;
  isEditable?: boolean;
  value?: string;
  onFieldChange?: (field: string, value: string) => void;
  color?: ColorVariant | 'inherit';
}

export const EditableText: React.FC<EditableTextProps> = ({
  field,
  children,
  defaultValue = '',
  isEditable = false,
  value,
  onFieldChange,
  color = 'inherit', // Default to inherit so it picks up parent color (like button text)
  ...textProps
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

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newValue = e.currentTarget.textContent || '';
    if (newValue !== currentValue) {
      handleFieldChangeWrapper(newValue);
    }
  };

  if (isEditable) {
    return (
      <Text
        {...textProps}
        color={color}
        contentEditable
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        onFocus={(e: React.FocusEvent<HTMLDivElement>) => {
          e.currentTarget.style.border = '1px dashed var(--primary-color)';
          e.currentTarget.style.backgroundColor = 'var(--background-secondary)';
        }}
        onBlur={(e: React.FocusEvent<HTMLDivElement>) => {
          e.currentTarget.style.border = '1px dashed var(--primary-color)';
          e.currentTarget.style.backgroundColor = 'var(--background-primary)';
          handleBlur(e);
        }}
      >
        {currentValue}
      </Text>
    );
  }

  // Normal display mode - behaves exactly like regular Text component
  return (
    <Text {...textProps} color={color}>
      {currentValue}
    </Text>
  );
}; 