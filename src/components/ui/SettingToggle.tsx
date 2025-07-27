import React from 'react';
import { Input, Label, Text } from './index';
import { Container, Span } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

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
    <Container className={`setting-toggle ${disabled ? 'setting-toggle-disabled' : ''}`}>
      <Stack>
        <Stack direction="horizontal" align="center" spacing="sm">
          {icon && (
            <Span>
              {icon}
            </Span>
          )}
          <Label htmlFor={id}>
            {label}
          </Label>
        </Stack>
        <Text>{description}</Text>
      </Stack>
      <Container>
        <label>
          <Input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
          />
          <Span className={`setting-toggle-slider ${checked ? 'setting-toggle-slider-checked' : ''}`}></Span>
        </label>
      </Container>
    </Container>
  );
}; 