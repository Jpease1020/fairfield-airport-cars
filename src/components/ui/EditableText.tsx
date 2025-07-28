'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, fontFamily, transitions } from '@/lib/design-system/tokens';
import { Text } from '@/components/ui';
import { useEditMode } from '@/components/admin/EditModeProvider';
import { getContent } from '@/lib/content/content-mapping';

// Styled edit container
const EditContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Styled editable div - inherits styling from parent
const EditableDiv = styled.div`
  /* Inherit all typography from parent */
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
  line-height: inherit;
  text-align: inherit;
  
  /* Only add edit-specific styling */
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
  
  // HTML attributes
  id,
  
  // Rest props
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

  if (editMode && handleFieldChange) {
    return (
      <EditContainer>
        <EditableDiv
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
  // Render directly to inherit parent styling
  return (
    <span id={id} {...rest}>
      {currentValue}
    </span>
  );
}; 