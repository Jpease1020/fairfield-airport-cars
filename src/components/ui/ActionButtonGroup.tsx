import React from 'react';

export interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: string;
}

export interface ActionButtonGroupProps {
  buttons: ActionButton[];
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  buttons,
  orientation = 'horizontal',
  spacing = 'xs',
  className = ''
}) => {
  const getSpacingValue = () => {
    switch (spacing) {
      case 'xs': return 'var(--spacing-xs)';
      case 'sm': return 'var(--spacing-sm)';
      case 'md': return 'var(--spacing-md)';
      case 'lg': return 'var(--spacing-lg)';
      default: return 'var(--spacing-xs)';
    }
  };

  const getButtonClass = (button: ActionButton) => {
    const baseClass = 'btn';
    const variantClass = button.variant === 'primary' ? 'btn-primary' : 
                       button.variant === 'secondary' ? 'btn-secondary' : 'btn-outline';
    const sizeClass = button.size ? `btn-${button.size}` : 'btn-sm';
    
    return `${baseClass} ${variantClass} ${sizeClass}`;
  };

  return (
    <div 
      className={className}
      style={{
        display: 'flex',
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
        gap: getSpacingValue(),
        alignItems: orientation === 'horizontal' ? 'center' : 'stretch'
      }}
    >
      {buttons.map((button, index) => (
        <button
          key={index}
          className={getButtonClass(button)}
          onClick={button.onClick}
          disabled={button.disabled}
        >
          {button.icon && (
            <span style={{ marginRight: 'var(--spacing-xs)' }}>
              {button.icon}
            </span>
          )}
          {button.label}
        </button>
      ))}
    </div>
  );
}; 