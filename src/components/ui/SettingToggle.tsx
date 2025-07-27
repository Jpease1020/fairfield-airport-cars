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
      <div >
        <div >
          {icon && (
            <span >
              {icon}
            </span>
          )}
          <Label 
            htmlFor={id}
            
          >
            {label}
          </Label>
        </div>
        <Text >
          {description}
        </Text>
      </div>
      
      <div >
        <label >
          <Input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            
          />
          <span className={`setting-toggle-slider ${checked ? 'setting-toggle-slider-checked' : ''}`} />
        </label>
      </div>
    </div>
  );
}; 