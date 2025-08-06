'use client';

import React from 'react';
import { Heading, HeadingProps } from './Heading';

export interface EditableHeadingProps extends Omit<HeadingProps, 'children'> {
  field: string;
  children?: React.ReactNode;
  defaultValue?: string;
  isEditable?: boolean;
  value?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  onFieldChange?: (field: string, value: string) => void;
}

export const EditableHeading: React.FC<EditableHeadingProps> = ({
  field,
  children,
  defaultValue = '',
  isEditable = false,
  value,
  level = 2,
  onFieldChange,
  ...headingProps
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

  // Map level to heading element
  const getHeadingElement = (level: number): 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' => {
    return `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  };

  if (isEditable) {
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