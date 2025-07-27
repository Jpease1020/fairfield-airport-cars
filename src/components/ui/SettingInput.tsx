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
    <Container>
      <Stack direction="horizontal" spacing="sm" align="center">
        {icon && (
          <Span>
            {icon}
          </Span>
        )}
        <label 
          htmlFor={id}
          style={{
            fontWeight: '500',
            fontSize: '0.875rem',
            color: '#374151'
          }}
        >
          {label}
        </label>
      </Stack>
      
      {description && (
        <Text>
          {description}
        </Text>
      )}
      
      <Stack direction="horizontal" spacing="sm" align="stretch">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            flex: '1',
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            backgroundColor: disabled ? '#f9fafb' : 'white',
            color: disabled ? '#6b7280' : '#374151',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
        />
        
        {actions && (
          <Container>
            {actions}
          </Container>
        )}
      </Stack>
      
      {helpText && (
        <Text>
          {helpText}
          {helpLink && (
            <>
              {' '}
              <a 
                href={helpLink.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#2563eb',
                  textDecoration: 'underline'
                }}
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