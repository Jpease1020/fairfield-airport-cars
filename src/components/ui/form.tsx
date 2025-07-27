import React from 'react';
import { Container } from '@/components/ui';

export interface FormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
  method?: 'get' | 'post';
  action?: string;
  encType?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
  target?: string;
  noValidate?: boolean;
}

export const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  className = '',
  method = 'post',
  action,
  encType,
  target,
  noValidate = false,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      method={method}
      action={action}
      encType={encType}
      target={target}
      noValidate={noValidate}

    >
      {children}
    </form>
  );
};

export interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
  error?: string;
  required?: boolean;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  className = '',
  error,
  required = false,
}) => {
  return (
    <Container>
      {children}
      {error && <Container>{error}</Container>}
    </Container>
  );
};

export interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  children,
  htmlFor,
  className = '',
  required = false,
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`form-label ${required ? 'form-label-required' : ''} ${className}`}
    >
      {children}
      {required && <span className="form-label-required-indicator">*</span>}
    </label>
  );
};

export interface FieldsetProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const Fieldset: React.FC<FieldsetProps> = ({
  children,
  className = '',
  disabled = false,
}) => {
  return (
    <fieldset
      className={`form-fieldset ${disabled ? 'form-fieldset-disabled' : ''} ${className}`}
      disabled={disabled}
    >
      {children}
    </fieldset>
  );
};

export interface LegendProps {
  children: React.ReactNode;
  className?: string;
}

export const Legend: React.FC<LegendProps> = ({
  children,
  className = '',
}) => {
  return (
    <legend className={`form-legend ${className}`}>
      {children}
    </legend>
  );
};

export interface SelectProps {
  children: React.ReactNode;
  value?: string | number | readonly string[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  size?: number;
  [key: string]: any; // Allow additional props
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, value, onChange, className = '', id, name, disabled = false, required = false, multiple = false, size }, ref) => {
  return (
    <select
      ref={ref}
      value={value}
      onChange={onChange}
      id={id}
      name={name}
      disabled={disabled}
      required={required}
      multiple={multiple}
      size={size}
      className={`form-select ${disabled ? 'form-select-disabled' : ''} ${className}`}
    >
      {children}
    </select>
  );
});
Select.displayName = 'Select';

export interface OptionProps {
  children: React.ReactNode;
  value?: string | number;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Option: React.FC<OptionProps> = ({
  children,
  value,
  selected = false,
  disabled = false,
  className = '',
}) => {
  return (
    <option
      value={value}
      selected={selected}
      disabled={disabled}
      className={`form-option ${disabled ? 'form-option-disabled' : ''} ${className}`}
    >
      {children}
    </option>
  );
};

export interface OptGroupProps {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  className?: string;
}

export const OptGroup: React.FC<OptGroupProps> = ({
  children,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <optgroup
      label={label}
      disabled={disabled}
      className={`form-optgroup ${disabled ? 'form-optgroup-disabled' : ''} ${className}`}
    >
      {children}
    </optgroup>
  );
}; 