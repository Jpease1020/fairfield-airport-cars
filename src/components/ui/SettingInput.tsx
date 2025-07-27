import React from 'react';

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
    <div style={{
      padding: 'var(--spacing-md) 0',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-sm)'
      }}>
        {icon && (
          <span style={{ fontSize: 'var(--font-size-sm)' }}>
            {icon}
          </span>
        )}
        <label 
          htmlFor={id}
          style={{
            fontWeight: '500',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-primary)'
          }}
        >
          {label}
        </label>
      </div>
      
      {description && (
        <p style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-secondary)',
          margin: '0 0 var(--spacing-sm) 0',
          lineHeight: '1.4'
        }}>
          {description}
        </p>
      )}
      
      <div style={{
        display: 'flex',
        gap: 'var(--spacing-sm)',
        alignItems: 'stretch'
      }}>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}

          style={{
            flex: 1,
            opacity: disabled ? 0.6 : 1
          }}
        />
        
        {actions && (
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
            {actions}
          </div>
        )}
      </div>
      
      {helpText && (
        <p style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-secondary)',
          margin: 'var(--spacing-xs) 0 0 0',
          lineHeight: '1.4'
        }}>
          {helpText}
          {helpLink && (
            <>
              {' '}
              <a 
                href={helpLink.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--primary-color)',
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                {helpLink.text}
              </a>
            </>
          )}
        </p>
      )}
    </div>
  );
}; 