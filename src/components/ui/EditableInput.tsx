import React from 'react';
import { Input } from '@/components/ui/input';
import { Container, Label } from '@/components/ui';
import { cn } from '@/lib/utils/utils';

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
    size = 'md', 
    variant = 'normal', 
    value, 
    onChange, 
    placeholder, 
    disabled = false, 
    type = 'text', 
    spacing = 'md' 
  }) => {
    const sizeClasses = {
      sm: 'h-8 text-sm',
      md: 'h-10 text-base',
      lg: 'h-12 text-lg',
      xl: 'h-14 text-xl'
    };

    const variantClasses = {
      title: 'text-3xl font-bold',
      subtitle: 'text-xl font-semibold',
      normal: 'text-base'
    };

    return (
      <Container spacing={spacing}>
        {label && (
          <Label>
            {label}
          </Label>
        )}
        <Input
          variant={variant === 'normal' ? 'default' : 'enhanced'}
          size={size}
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