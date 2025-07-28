import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, shadows, transitions } from '@/lib/design-system/tokens';

// Styled form component
const StyledForm = styled.form`
  display: block;
  width: 100%;
`;

// Styled form group component
const StyledFormGroup = styled.div.withConfig({
  shouldForwardProp: (prop) => !['error', 'required'].includes(prop)
})<{
  error: boolean;
  required: boolean;
}>`
  display: block;
  margin-bottom: ${spacing.md};
  
  ${({ error }) => error && `
    & > * {
      border-color: ${colors.border.error};
    }
  `}
`;

// Styled error message
const ErrorMessage = styled.div`
  color: ${colors.danger[600]};
  font-size: ${fontSize.sm};
  margin-top: ${spacing.xs};
  display: block;
`;

// Styled label component
const StyledLabel = styled.label.withConfig({
  shouldForwardProp: (prop) => !['required'].includes(prop)
})<{
  required: boolean;
}>`
  display: block;
  font-weight: 500;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.xs};
  
  ${({ required }) => required && `
    &::after {
      content: ' *';
      color: ${colors.danger[600]};
    }
  `}
`;

// Styled fieldset component
const StyledFieldset = styled.fieldset.withConfig({
  shouldForwardProp: (prop) => !['disabled'].includes(prop)
})<{
  disabled: boolean;
}>`
  border: 1px solid ${colors.border.default};
  border-radius: ${borderRadius.default};
  padding: ${spacing.md};
  margin: 0;
  
  ${({ disabled }) => disabled && `
    opacity: 0.6;
    pointer-events: none;
  `}
`;

// Styled legend component
const StyledLegend = styled.legend`
  font-weight: 600;
  color: ${colors.text.primary};
  padding: 0 ${spacing.sm};
`;

// Styled select component
const StyledSelect = styled.select.withConfig({
  shouldForwardProp: (prop) => !['error', 'size'].includes(prop)
})<{
  error: boolean;
  size: 'sm' | 'md' | 'lg';
}>`
  display: block;
  width: 100%;
  border: 1px solid ${({ error }) => (error ? colors.border.error : colors.border.default)};
  border-radius: ${borderRadius.default};
  background-color: ${colors.background.primary};
  color: ${colors.text.primary};
  outline: none;
  transition: ${transitions.default};
  box-sizing: border-box;
  font-family: inherit;

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${spacing.sm} ${spacing.md};
          font-size: ${fontSize.sm};
          height: 2rem;
        `;
      case 'md':
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.md};
          height: 2.5rem;
        `;
      case 'lg':
        return `
          padding: ${spacing.lg} ${spacing.xl};
          font-size: ${fontSize.lg};
          height: 3rem;
        `;
      default:
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.md};
          height: 2.5rem;
        `;
    }
  }}

  /* Focus styles */
  &:focus {
    border-color: ${({ error }) => (error ? colors.border.error : colors.primary[600])};
    box-shadow: ${({ error }) => (error ? shadows.error : shadows.focus)};
  }

  /* Disabled styles */
  &:disabled {
    background-color: ${colors.background.disabled};
    color: ${colors.text.disabled};
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* Error styles */
  ${({ error }) => error && `
    border-color: ${colors.border.error};
    
    &:focus {
      border-color: ${colors.border.error};
      box-shadow: ${shadows.error};
    }
  `}
`;

// Styled option component
const StyledOption = styled.option`
  color: ${colors.text.primary};
  background-color: ${colors.background.primary};
`;

// Styled optgroup component
const StyledOptGroup = styled.optgroup`
  color: ${colors.text.primary};
  background-color: ${colors.background.primary};
`;

export interface FormProps {
  // Core props
  children: React.ReactNode;
  
  // Form attributes
  onSubmit?: (e: React.FormEvent) => void;
  method?: 'get' | 'post';
  action?: string;
  encType?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
  target?: string;
  noValidate?: boolean;
  
  // Rest props
  [key: string]: any;
}

export const Form: React.FC<FormProps> = ({
  // Core props
  children,
  
  // Form attributes
  onSubmit,
  method = 'post',
  action,
  encType,
  target,
  noValidate = false,
  
  // Rest props
  ...rest
}) => {
  return (
    <StyledForm
      onSubmit={onSubmit}
      method={method}
      action={action}
      encType={encType}
      target={target}
      noValidate={noValidate}
      {...rest}
    >
      {children}
    </StyledForm>
  );
};

export interface FormGroupProps {
  // Core props
  children: React.ReactNode;
  
  // States
  error?: string;
  required?: boolean;
  
  // Rest props
  [key: string]: any;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  // Core props
  children,
  
  // States
  error,
  required = false,
  
  // Rest props
  ...rest
}) => {
  return (
    <StyledFormGroup
      error={!!error}
      required={required}
      {...rest}
    >
      {children}
      {error && (
        <ErrorMessage role="alert">
          {error}
        </ErrorMessage>
      )}
    </StyledFormGroup>
  );
};

export interface LabelProps {
  // Core props
  children: React.ReactNode;
  
  // Form attributes
  htmlFor?: string;
  required?: boolean;
  
  // Rest props
  [key: string]: any;
}

export const Label: React.FC<LabelProps> = ({
  // Core props
  children,
  
  // Form attributes
  htmlFor,
  required = false,
  
  // Rest props
  ...rest
}) => {
  return (
    <StyledLabel
      htmlFor={htmlFor}
      required={required}
      {...rest}
    >
      {children}
    </StyledLabel>
  );
};

export interface FieldsetProps {
  // Core props
  children: React.ReactNode;
  
  // States
  disabled?: boolean;
  
  // Rest props
  [key: string]: any;
}

export const Fieldset: React.FC<FieldsetProps> = ({
  // Core props
  children,
  
  // States
  disabled = false,
  
  // Rest props
  ...rest
}) => {
  return (
    <StyledFieldset
      disabled={disabled}
      {...rest}
    >
      {children}
    </StyledFieldset>
  );
};

export interface LegendProps {
  // Core props
  children: React.ReactNode;
  
  // Rest props
  [key: string]: any;
}

export const Legend: React.FC<LegendProps> = ({
  // Core props
  children,
  
  // Rest props
  ...rest
}) => {
  return (
    <StyledLegend {...rest}>
      {children}
    </StyledLegend>
  );
};

export interface SelectProps {
  // Core props
  children: React.ReactNode;
  
  // Form attributes
  value?: string | number | readonly string[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  size?: number;
  
  // Appearance
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  
  // Rest props
  [key: string]: any;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    // Core props
    children, 
    
    // Form attributes
    value, 
    onChange, 
    id, 
    name, 
    disabled = false, 
    required = false, 
    multiple = false, 
    size: selectSize,
    
    // Appearance
    error = false,
    size = 'md',
    
    // Rest props
    ...rest 
  }, ref) => {
    return (
      <StyledSelect
        ref={ref}
        value={value}
        onChange={onChange}
        id={id}
        name={name}
        disabled={disabled}
        required={required}
        multiple={multiple}
        size={selectSize}
        error={error}
        size={size}
        {...rest}
      >
        {children}
      </StyledSelect>
    );
  }
);

Select.displayName = 'Select';

export interface OptionProps {
  // Core props
  children: React.ReactNode;
  
  // Form attributes
  value?: string | number;
  selected?: boolean;
  disabled?: boolean;
  
  // Rest props
  [key: string]: any;
}

export const Option: React.FC<OptionProps> = ({
  // Core props
  children,
  
  // Form attributes
  value,
  selected = false,
  disabled = false,
  
  // Rest props
  ...rest
}) => {
  return (
    <StyledOption
      value={value}
      selected={selected}
      disabled={disabled}
      {...rest}
    >
      {children}
    </StyledOption>
  );
};

export interface OptGroupProps {
  // Core props
  children: React.ReactNode;
  
  // Form attributes
  label: string;
  disabled?: boolean;
  
  // Rest props
  [key: string]: any;
}

export const OptGroup: React.FC<OptGroupProps> = ({
  // Core props
  children,
  
  // Form attributes
  label,
  disabled = false,
  
  // Rest props
  ...rest
}) => {
  return (
    <StyledOptGroup
      label={label}
      disabled={disabled}
      {...rest}
    >
      {children}
    </StyledOptGroup>
  );
}; 