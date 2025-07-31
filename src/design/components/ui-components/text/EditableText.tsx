'use client';

import React from 'react';
import { Text, TextProps } from './Text';
import { useEditMode } from '../../../providers/EditModeProvider';
import { getContent } from '@/lib/content/content-mapping';
import { colors } from '@/design/system/tokens/tokens';

export interface EditableTextProps extends Omit<TextProps, 'children'> {
  field: string;
  children?: React.ReactNode;
  defaultValue?: string;
  onFieldChange?: (field: string, value: string) => void;
}

export const EditableText: React.FC<EditableTextProps> = ({
  field,
  children,
  defaultValue = '',
  onFieldChange,
  ...textProps
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

  if (editMode) {
    return (
      <Text
        {...textProps}
        contentEditable
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        onFocus={(e: React.FocusEvent<HTMLDivElement>) => {
          e.currentTarget.style.border = `1px dashed ${colors.primary[600]}`;
          e.currentTarget.style.backgroundColor = colors.background.secondary;
        }}
        onBlur={(e: React.FocusEvent<HTMLDivElement>) => {
          e.currentTarget.style.border = `1px dashed ${colors.primary[600]}`;
          e.currentTarget.style.backgroundColor = colors.background.primary;
          handleBlur(e);
        }}
      >
        {currentValue}
      </Text>
    );
  }

  return (
    <Text {...textProps}>
      {currentValue}
    </Text>
  );
}; 