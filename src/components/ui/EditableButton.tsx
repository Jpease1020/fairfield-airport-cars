'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, transitions } from '@/lib/design-system/tokens';
import { Button } from '@/components/ui';
import { useEditMode } from '@/components/admin/EditModeProvider';

// Styled edit container
const EditContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Styled editable div
const EditableDiv = styled.div.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size'].includes(prop)
})<{
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
}>`
  font-size: ${({ size }) => {
    switch (size) {
      case 'sm':
        return fontSize.sm;
      case 'lg':
        return fontSize.lg;
      default:
        return fontSize.md;
    }
  }};
  text-align: center;
  padding: ${({ size }) => {
    switch (size) {
      case 'sm':
        return `${spacing.xs} ${spacing.sm}`;
      case 'lg':
        return `${spacing.md} ${spacing.lg}`;
      default:
        return `${spacing.sm} ${spacing.md}`;
    }
  }};
  border: 1px dashed ${colors.border.default};
  border-radius: 6px;
  min-height: 1em;
  background-color: ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return colors.primary[600];
      default:
        return 'transparent';
    }
  }};
  color: ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return colors.text.white;
      default:
        return colors.text.primary;
    }
  }};
  cursor: text;
  transition: ${transitions.default};

  &:focus {
    outline: none;
    border-color: ${colors.primary[600]};
    box-shadow: 0 0 0 2px ${colors.primary[200]};
  }
`;

// Styled icon container
const IconContainer = styled.span`
  display: inline-flex;
  align-items: center;
  margin-right: ${spacing.xs};
`;

export interface EditableButtonProps {
  // Core props
  field: string; // Database field path (e.g., "hero.ctaText")
  children?: React.ReactNode; // Fallback content (existing text)
  defaultValue?: string; // Default text if no database value
  
  // Appearance
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  
  // States
  disabled?: boolean;
  
  // Behavior
  onClick?: () => void;
  icon?: string;
  
  // HTML attributes
  id?: string;
  
  // Rest props
  [key: string]: any;
}

export const EditableButton: React.FC<EditableButtonProps> = ({
  // Core props
  field,
  children,
  defaultValue = '',
  
  // Appearance
  variant = 'primary',
  size = 'md',
  
  // States
  disabled = false,
  
  // Behavior
  onClick,
  icon,
  
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
      <EditContainer>
        <EditableDiv
          variant={variant}
          size={size}
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
          {icon && <IconContainer>{icon}</IconContainer>}
          {currentValue}
        </EditableDiv>
      </EditContainer>
    );
  }

  // Display mode - show database value or fallback to children
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {icon && <IconContainer>{icon}</IconContainer>}
      {currentValue}
    </Button>
  );
}; 