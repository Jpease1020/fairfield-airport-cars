'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, transitions } from '@/lib/design-system/tokens';
import { Text, Link } from '@/components/ui';

// Styled container
const SettingInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

// Styled label row
const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

// Styled icon container
const IconContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.text.secondary};
  font-size: ${fontSize.md};
`;

// Styled label
const StyledLabel = styled.label.withConfig({
  shouldForwardProp: (prop) => !['disabled'].includes(prop)
})<{
  disabled: boolean;
}>`
  font-weight: 500;
  font-size: ${fontSize.sm};
  color: ${({ disabled }) => disabled ? colors.text.disabled : colors.text.primary};
  transition: ${transitions.default};
`;

// Styled input row
const InputRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: ${spacing.sm};
`;

// Styled input
const StyledInput = styled.input.withConfig({
  shouldForwardProp: (prop) => !['disabled'].includes(prop)
})<{
  disabled: boolean;
}>`
  flex: 1;
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${colors.border.default};
  border-radius: 6px;
  font-size: ${fontSize.sm};
  background-color: ${({ disabled }) => disabled ? colors.background.secondary : colors.background.primary};
  color: ${({ disabled }) => disabled ? colors.text.disabled : colors.text.primary};
  outline: none;
  transition: ${transitions.default};

  &:focus {
    border-color: ${colors.primary[600]};
    box-shadow: 0 0 0 2px ${colors.primary[200]};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

// Styled actions container
const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

// Styled help container
const HelpContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

export interface SettingInputProps {
  // Core props
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  
  // Content
  description?: string;
  helpText?: string;
  helpLink?: {
    text: string;
    href: string;
  };
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  
  // Appearance
  type?: 'text' | 'password' | 'email' | 'number';
  placeholder?: string;
  
  // States
  disabled?: boolean;
  
  // HTML attributes
  [key: string]: any;
}

export const SettingInput: React.FC<SettingInputProps> = ({
  // Core props
  id,
  label,
  value,
  onChange,
  
  // Content
  description,
  helpText,
  helpLink,
  icon,
  actions,
  
  // Appearance
  type = 'text',
  placeholder,
  
  // States
  disabled = false,
  
  // HTML attributes
  ...rest
}) => {
  return (
    <SettingInputContainer>
      <LabelRow>
        {icon && (
          <IconContainer>
            {icon}
          </IconContainer>
        )}
        <StyledLabel
          htmlFor={id}
          disabled={disabled}
        >
          {label}
        </StyledLabel>
      </LabelRow>
      
      {description && (
        <Text>
          {description}
        </Text>
      )}
      
      <InputRow>
        <StyledInput
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          {...rest}
        />
        
        {actions && (
          <ActionsContainer>
            {actions}
          </ActionsContainer>
        )}
      </InputRow>
      
      {helpText && (
        <HelpContainer>
          <Text>
            {helpText}
            {helpLink && (
              <>
                {' '}
                <Link 
                  href={helpLink.href}
                  target="_blank"
                  external
                >
                  {helpLink.text}
                </Link>
              </>
            )}
          </Text>
        </HelpContainer>
      )}
    </SettingInputContainer>
  );
}; 