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
  const getButtonClass = (button: ActionButton) => {
    const baseClass = 'action-button';
    const variantClass = button.variant === 'primary' ? 'action-button-primary' : 
                       button.variant === 'secondary' ? 'action-button-secondary' : 'action-button-outline';
    const sizeClass = button.size ? `action-button-${button.size}` : 'action-button-sm';
    
    return `${baseClass} ${variantClass} ${sizeClass}`;
  };

  const containerClass = [
    'action-button-group',
    `action-button-group-${orientation}`,
    `action-button-group-${spacing}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      {buttons.map((button, index) => (
        <button
          key={index}
          className={getButtonClass(button)}
          onClick={button.onClick}
          disabled={button.disabled}
        >
          {button.icon && (
            <span className="action-button-icon">
              {button.icon}
            </span>
          )}
          <span className="action-button-label">
            {button.label}
          </span>
        </button>
      ))}
    </div>
  );
}; 