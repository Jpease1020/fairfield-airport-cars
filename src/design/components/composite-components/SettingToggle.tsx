'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, transitions } from '../../system/tokens/tokens';
import { Text } from '../base-components/text/Text';

// Styled setting toggle container
const SettingToggleContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['disabled'].includes(prop)
})<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.md};
  border-radius: ${borderRadius.lg};
  background-color: ${colors.background.primary};
  border: 1px solid ${colors.border.light};
  transition: ${transitions.default};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  
  &:hover:not([data-disabled="true"]) {
    background-color: ${colors.background.secondary};
    border-color: ${colors.border.default};
  }
`;

// Styled content container
const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
  flex: 1;
`;

// Styled header container
const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

// Styled icon container
const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.text.secondary};
  font-size: ${fontSize.md};
`;

// Styled toggle container
const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Styled toggle label
const ToggleLabel = styled.label.withConfig({
  shouldForwardProp: (prop) => !['checked', 'disabled'].includes(prop)
})<{ checked: boolean; disabled: boolean }>`
  position: relative;
  display: inline-block;
  width: 3rem;
  height: 1.5rem;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  
  /* Hide the actual checkbox */
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  /* Toggle slider */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({ checked, disabled }) => {
      if (disabled) return colors.gray[300];
      return checked ? colors.primary[600] : colors.gray[300];
    }};
    border-radius: ${borderRadius.pill};
    transition: ${transitions.default};
  }
  
  /* Toggle thumb */
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 1.1rem;
    height: 1.1rem;
    background-color: white;
    border-radius: 50%;
    transition: ${transitions.default};
    transform: translateX(${({ checked }) => (checked ? '1.5rem' : '0')});
  }
`;

interface SettingToggleProps {
  // Core props
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  
  // States
  disabled?: boolean;
  
  // Content
  icon?: React.ReactNode;
  
  // Rest props
  [key: string]: any;
}

export const SettingToggle: React.FC<SettingToggleProps> = ({
  // Core props
  id,
  label,
  description,
  checked,
  onChange,
  
  // States
  disabled = false,
  
  // Content
  icon,
  
  // Rest props
  ...rest
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  };

  return (
    <SettingToggleContainer disabled={disabled} data-disabled={disabled} {...rest}>
      <ContentContainer>
        <HeaderContainer>
          {icon && (
            <IconContainer>
              {icon}
            </IconContainer>
          )}
          <div>
            <Text variant="body" weight="medium">
              {label}
            </Text>
            <Text variant="small" color="muted">
              {description}
            </Text>
          </div>
        </HeaderContainer>
      </ContentContainer>
      
      <ToggleContainer>
        <ToggleLabel checked={checked} disabled={disabled}>
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            onKeyDown={handleKeyDown}
          />
        </ToggleLabel>
      </ToggleContainer>
    </SettingToggleContainer>
  );
}; 