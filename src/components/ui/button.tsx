import React from 'react';

// Button Component - Clean Reusable Component (No className!)
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  shape?: 'default' | 'rounded' | 'pill' | 'square';
  as?: 'button' | 'a' | 'div';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  shape = 'default',
  as: Component = 'button'
}) => {
  return (
    <Component
      type={Component === 'button' ? type : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '500',
        outline: 'none',
        transition: 'colors 0.2s',
        opacity: disabled || loading ? '0.5' : '1',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        padding: size === 'xs' ? '0.25rem 0.5rem' : 
                size === 'sm' ? '0.5rem 0.75rem' :
                size === 'md' ? '0.5rem 1rem' :
                size === 'lg' ? '0.75rem 1.5rem' : '1rem 2rem',
        fontSize: size === 'xs' ? '0.75rem' :
                 size === 'sm' ? '0.875rem' :
                 size === 'md' ? '1rem' :
                 size === 'lg' ? '1.125rem' : '1.25rem',
        borderRadius: shape === 'default' ? '0.375rem' :
                    shape === 'rounded' ? '0.5rem' :
                    shape === 'pill' ? '9999px' : '0',
        width: fullWidth ? '100%' : 'auto',
        backgroundColor: variant === 'primary' ? '#2563eb' :
                       variant === 'secondary' ? '#4b5563' :
                       variant === 'outline' ? 'transparent' :
                       variant === 'ghost' ? 'transparent' :
                       variant === 'danger' ? '#dc2626' :
                       variant === 'success' ? '#16a34a' :
                       variant === 'warning' ? '#ca8a04' : '#2563eb',
        color: variant === 'outline' || variant === 'ghost' ? '#374151' : 'white',
        border: variant === 'outline' ? '1px solid #d1d5db' : 'none',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <svg style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem', height: '1rem', width: '1rem' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: '0.25' }}></circle>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ opacity: '0.75' }}></path>
        </svg>
      )}
      {icon && !loading && iconPosition === 'left' && <span style={{ marginRight: '0.5rem' }}>{icon}</span>}
      <span>{children}</span>
      {icon && !loading && iconPosition === 'right' && <span style={{ marginLeft: '0.5rem' }}>{icon}</span>}
    </Component>
  );
}; 