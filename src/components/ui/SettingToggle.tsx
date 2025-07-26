import React from 'react';

export interface SettingToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const SettingToggle: React.FC<SettingToggleProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  icon
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--spacing-md) 0',
      borderBottom: '1px solid var(--border-color)',
      opacity: disabled ? 0.6 : 1
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-xs)'
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
              color: 'var(--text-primary)',
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
          >
            {label}
          </label>
        </div>
        <p style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-secondary)',
          margin: 0,
          lineHeight: '1.4'
        }}>
          {description}
        </p>
      </div>
      
      <div style={{ marginLeft: 'var(--spacing-lg)' }}>
        <label style={{ 
          position: 'relative', 
          display: 'inline-block', 
          width: '48px', 
          height: '24px',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}>
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            style={{
              opacity: 0,
              width: 0,
              height: 0
            }}
          />
          <span style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: checked ? 'var(--primary-color)' : '#ccc',
            transition: '0.3s',
            borderRadius: '24px'
          }} />
          <span style={{
            position: 'absolute',
            height: '18px',
            width: '18px',
            left: checked ? '27px' : '3px',
            top: '3px',
            backgroundColor: 'white',
            transition: '0.3s',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }} />
        </label>
      </div>
    </div>
  );
}; 