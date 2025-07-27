import React from 'react';
import { Span, Container } from '@/components/ui';

export interface FormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  method?: 'get' | 'post';
  action?: string;
  encType?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
  target?: string;
  noValidate?: boolean;
}

export const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
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
  error?: string;
  required?: boolean;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
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
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  children,
  htmlFor,
  required = false,
}) => {
  return (
    <label htmlFor={htmlFor}>
      {children}
      {required && <Span className="form-label-required-indicator">*</Span>}
    </label>
  );
};

export interface FieldsetProps {
  children: React.ReactNode;
  disabled?: boolean;
}

export const Fieldset: React.FC<FieldsetProps> = ({
  children,
  disabled = false,
}) => {
  return (
    <fieldset disabled={disabled}>
      {children}
    </fieldset>
  );
};

export interface LegendProps {
  children: React.ReactNode;
}

export const Legend: React.FC<LegendProps> = ({
  children,
}) => {
  return (
    <legend>
      {children}
    </legend>
  );
};

export interface SelectProps {
  children: React.ReactNode;
  value?: string | number | readonly string[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  size?: number;
  [key: string]: any; // Allow additional props
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, value, onChange, id, name, disabled = false, required = false, multiple = false, size }, ref) => {
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
}

export const Option: React.FC<OptionProps> = ({
  children,
  value,
  selected = false,
  disabled = false,
}) => {
  return (
    <option
      value={value}
      selected={selected}
      disabled={disabled}
    >
      {children}
    </option>
  );
};

export interface OptGroupProps {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
}

export const OptGroup: React.FC<OptGroupProps> = ({
  children,
  label,
  disabled = false,
}) => {
  return (
    <optgroup label={label} disabled={disabled}>
      {children}
    </optgroup>
  );
}; 