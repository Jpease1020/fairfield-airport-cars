'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, transitions } from '@/lib/design-system/tokens';
import { H1, H2, H3, H4, H5, H6 } from '@/components/ui';
import { useEditMode } from '@/components/admin/EditModeProvider';

// Styled edit container
const EditContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Styled editable div
const EditableDiv = styled.div.withConfig({
  shouldForwardProp: (prop) => !['level', 'align', 'color'].includes(prop)
})<{
  level: 1 | 2 | 3 | 4 | 5 | 6;
  align: 'left' | 'center' | 'right';
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
  font-size: ${({ level }) => {
    switch (level) {
      case 1:
        return fontSize['2xl'];
      case 2:
        return fontSize.xl;
      case 3:
        return fontSize.lg;
      case 4:
        return fontSize.md;
      case 5:
        return fontSize.sm;
      default:
        return fontSize.xs;
    }
  }};
  font-weight: bold;
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

export interface EditableHeadingProps {
  // Core props
  field: string; // Database field path (e.g., "hero.title")
  children?: React.ReactNode; // Fallback content (existing text)
  defaultValue?: string; // Default text if no database value
  
  // Appearance
  level?: 1 | 2 | 3 | 4 | 5 | 6; // Heading level
  align?: 'left' | 'center' | 'right';
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'info';
  
  // HTML attributes
  id?: string;
  
  // Rest props
  [key: string]: any;
}

export const EditableHeading: React.FC<EditableHeadingProps> = ({
  // Core props
  field,
  children,
  defaultValue = '',
  
  // Appearance
  level = 2,
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
          level={level}
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
}; 