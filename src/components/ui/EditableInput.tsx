import React from 'react';
import { Input } from '@/components/ui/input';
import { Container, Label } from '@/components/ui';

// EditableInput Component - BULLETPROOF TYPE SAFETY!
interface EditableInputProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'title' | 'subtitle' | 'normal';
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password' | 'number';
  spacing?: 'sm' | 'md' | 'lg';
}

const EditableInput: React.FC<EditableInputProps> = ({ 
    label, 
    value, 
    onChange, 
    placeholder, 
    disabled = false, 
    type = 'text', 
    spacing = 'md' 
  }) => {

    return (
      <Container spacing={spacing}>
        {label && (
          <Label>
            {label}
          </Label>
        )}
        <Input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          type={type}
        />
      </Container>
    );
  };

EditableInput.displayName = 'EditableInput';

export { EditableInput }; 