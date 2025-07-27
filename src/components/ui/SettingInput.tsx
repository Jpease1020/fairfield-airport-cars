import React from 'react';
import { Container, Text, Span } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

export interface SettingInputProps {
  id: string;
  label: string;
  description?: string;
  type?: 'text' | 'password' | 'email' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  helpText?: string;
  helpLink?: {
    text: string;
    href: string;
  };
}

export const SettingInput: React.FC<SettingInputProps> = ({
  id,
  label,
  description,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  icon,
  actions,
  helpText,
  helpLink
}) => {
  return (
    <Container className="setting-input">
      <Stack direction="horizontal" spacing="sm" align="center" className="setting-input-header">
        {icon && (
          <Span className="setting-input-icon">
            {icon}
          </Span>
        )}
        <label 
          htmlFor={id}
          className="setting-input-label"
        >
          {label}
        </label>
      </Stack>
      
      {description && (
        <Text className="setting-input-description">
          {description}
        </Text>
      )}
      
      <Stack direction="horizontal" spacing="sm" align="stretch" className="setting-input-controls">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`setting-input-field ${disabled ? 'disabled' : ''}`}
        />
        
        {actions && (
          <Container className="setting-input-actions">
            {actions}
          </Container>
        )}
      </Stack>
      
      {helpText && (
        <Text className="setting-input-help">
          {helpText}
          {helpLink && (
            <>
              {' '}
              <a 
                href={helpLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className="setting-input-help-link"
              >
                {helpLink.text}
              </a>
            </>
          )}
        </Text>
      )}
    </Container>
  );
}; 