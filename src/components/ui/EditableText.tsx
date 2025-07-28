'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, transitions } from '@/lib/design-system/tokens';
import { Text } from '@/components/ui';
import { useEditMode } from '@/components/admin/EditModeProvider';
import { getContent } from '@/lib/content/content-mapping';

// Styled edit container
const EditContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Styled editable div
const EditableDiv = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'align', 'color'].includes(prop)
})<{
  variant: 'body' | 'lead' | 'small' | 'muted' | 'caption' | 'overline';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align: 'left' | 'center' | 'right' | 'justify';
  color: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';
}>`
  color: ${({ color }) => {
    switch (color) {
      case 'secondary':
        return colors.text.secondary;
      case 'muted':
        return colors.text.disabled;
      case 'success':
        return colors.success[600];
      case 'warning':
        return colors.warning[600];
      case 'error':
        return colors.danger[600];
      case 'info':
        return colors.primary[600];
      default:
        return colors.text.primary;
    }
  }};
  font-size: ${({ size }) => {
    switch (size) {
      case 'xs':
        return fontSize.xs;
      case 'sm':
        return fontSize.sm;
      case 'lg':
        return fontSize.lg;
      case 'xl':
        return fontSize.xl;
      default:
        return fontSize.md;
    }
  }};
  text-align: ${({ align }) => align};
  padding: ${spacing.xs};
  border: 1px dashed ${colors.border.default};
  border-radius: 4px;
  min-height: 1em;
  transition: ${transitions.default};

  &:focus {
    outline: none;
    border-color: ${colors.primary[600]};
    box-shadow: 0 0 0 2px ${colors.primary[200]};
  }
`;

export interface EditableTextProps {
  // Core props
  field: string; // Database field path (e.g., "commentWidget.title")
  children?: React.ReactNode; // Fallback content (existing text)
  defaultValue?: string; // Default text if no database value
  
  // Appearance
  variant?: 'body' | 'lead' | 'small' | 'muted' | 'caption' | 'overline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';
  
  // HTML attributes
  id?: string;
  
  // Rest props
  [key: string]: any;
}

export const EditableText: React.FC<EditableTextProps> = ({
  // Core props
  field,
  children,
  defaultValue = '',
  
  // Appearance
  variant = 'body',
  size = 'md',
  align = 'left',
  color = 'primary',
  
  // HTML attributes
  id,
  
  // Rest props
  ...rest
}) => {
  const { editMode, localContent, handleFieldChange } = useEditMode();

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

  if (editMode) {
    return (
      <EditContainer>
        <EditableDiv
          variant={variant}
          size={size}
          align={align}
          color={color}
          contentEditable
          suppressContentEditableWarning
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
          id={id}
          {...rest}
        >
          {currentValue}
        </EditableDiv>
      </EditContainer>
    );
  }

  // Display mode - show database value or fallback to children
  return (
    <Text
      variant={variant}
      size={size}
      align={align}
      color={color}
      id={id}
      {...rest}
    >
      {currentValue}
    </Text>
  );
}; 