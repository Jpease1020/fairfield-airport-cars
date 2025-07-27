import React from 'react';
import { Input, Label, Text } from './index';

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
    <div className={`setting-toggle ${disabled ? 'setting-toggle-disabled' : ''}`}>
      <div className="setting-toggle-content">
        <div className="setting-toggle-header">
          {icon && (
            <span className="setting-toggle-icon">
              {icon}
            </span>
          )}
          <Label 
            htmlFor={id}
            className="setting-toggle-label"
          >
            {label}
          </Label>
        </div>
        <Text className="setting-toggle-description">
          {description}
        </Text>
      </div>
      
      <div className="setting-toggle-control">
        <label className="setting-toggle-switch">
          <Input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="setting-toggle-input"
          />
          <span className={`setting-toggle-slider ${checked ? 'setting-toggle-slider-checked' : ''}`} />
        </label>
      </div>
    </div>
  );
}; 