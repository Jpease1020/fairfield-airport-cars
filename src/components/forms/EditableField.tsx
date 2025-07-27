import React from 'react';
import { EditableInput } from '@/components/ui/EditableInput';
import { EditableTextarea } from '@/components/ui/EditableTextarea';

// Clean EditableField - CASCADE EFFECT COMPLIANCE!
interface EditableFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'input' | 'textarea';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'title' | 'subtitle' | 'normal';
  rows?: number;
  placeholder?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onChange,
  type = 'input',
  size = 'md',
  variant = 'normal',
  rows = 3,
  placeholder,
  spacing = 'md'
}) => {
  if (type === 'textarea') {
    return (
      <EditableTextarea
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size={size}
        rows={rows}
        placeholder={placeholder}
        spacing={spacing}
      />
    );
  }

  return (
    <EditableInput
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size={size}
      variant={variant}
      placeholder={placeholder}
      spacing={spacing}
    />
  );
};

export { EditableField }; 