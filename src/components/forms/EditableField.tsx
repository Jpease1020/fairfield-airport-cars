import React from 'react';
import { EditableInput } from './EditableInput';
import { EditableTextarea } from './EditableTextarea';

interface EditableFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'input' | 'textarea';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'title' | 'subtitle' | 'normal';
  rows?: number;
  placeholder?: string;
  className?: string;
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
  className
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
        className={className}
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
      className={className}
    />
  );
};

export { EditableField }; 