import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, shadows, transitions } from '@/lib/design-system/tokens';
import { Input } from './input';
import { Textarea } from './textarea';
import { Label } from './form';

// Styled input wrapper
const InputWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['hasLeftIcon', 'hasRightIcon'].includes(prop)
})<{
  hasLeftIcon: boolean;
  hasRightIcon: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

// Styled icon container
const IconContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['position'].includes(prop)
})<{
  position: 'left' | 'right';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: ${colors.text.secondary};
  z-index: 1;
  
  ${({ position }) => position === 'left' ? `
    left: ${spacing.md};
  ` : `
    right: ${spacing.md};
  `}
`;

// Styled form field container
const FormFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

// Styled error message
const ErrorMessage = styled.div`
  color: ${colors.danger[600]};
  font-size: ${fontSize.sm};
  margin-top: ${spacing.xs};
`;

// Styled helper message
const HelperMessage = styled.div`
  color: ${colors.text.secondary};
  font-size: ${fontSize.sm};
  margin-top: ${spacing.xs};
`;

// Styled search icon
const SearchIcon = styled.span`
  font-size: ${fontSize.md};
`;

// Styled country code
const CountryCode = styled.span`
  color: ${colors.text.secondary};
  font-weight: 500;
`;

export interface EnhancedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  // Core props
  children?: React.ReactNode;
  
  // Form attributes
  label?: string;
  error?: string;
  helper?: string;
  
  // Appearance
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  
  // Icons
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  
  // Rest props
  [key: string]: any;
}

export const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    // Core props
    children,
    
    // Form attributes
    label, 
    error, 
    helper, 
    
    // Appearance
    variant = 'default',
    size = 'md',
    
    // Icons
    leftIcon, 
    rightIcon, 
    
    // Rest props
    ...props 
  }, ref) => {
    return (
      <FormFieldContainer>
        {label && (
          <Label htmlFor={props.id}>
            {label}
          </Label>
        )}
        <InputWrapper
          hasLeftIcon={!!leftIcon}
          hasRightIcon={!!rightIcon}
        >
          {leftIcon && (
            <IconContainer position="left">
              {leftIcon}
            </IconContainer>
          )}
          <Input
            ref={ref}
            size={size}
            error={!!error}
            {...props}
          />
          {rightIcon && (
            <IconContainer position="right">
              {rightIcon}
            </IconContainer>
          )}
        </InputWrapper>
        {error && (
          <ErrorMessage role="alert">
            {error}
          </ErrorMessage>
        )}
        {helper && !error && (
          <HelperMessage>
            {helper}
          </HelperMessage>
        )}
      </FormFieldContainer>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

export interface EnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // Core props
  children?: React.ReactNode;
  
  // Form attributes
  label?: string;
  error?: string;
  helper?: string;
  
  // Appearance
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  
  // Rest props
  [key: string]: any;
}

export const EnhancedTextarea = React.forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  ({ 
    // Core props
    children,
    
    // Form attributes
    label, 
    error, 
    helper,
    
    // Appearance
    variant = 'default',
    size = 'md',
    
    // Rest props
    ...props 
  }, ref) => {
    return (
      <FormFieldContainer>
        {label && (
          <Label htmlFor={props.id}>
            {label}
          </Label>
        )}
        <Textarea
          ref={ref}
          size={size}
          error={!!error}
          {...props}
        >
          {children}
        </Textarea>
        {error && (
          <ErrorMessage role="alert">
            {error}
          </ErrorMessage>
        )}
        {helper && !error && (
          <HelperMessage>
            {helper}
          </HelperMessage>
        )}
      </FormFieldContainer>
    );
  }
);

EnhancedTextarea.displayName = 'EnhancedTextarea';

export interface EnhancedSelectProps {
  // Core props
  children: React.ReactNode;
  
  // Form attributes
  label?: string;
  error?: string;
  helper?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  
  // Appearance
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  
  // Rest props
  [key: string]: any;
}

export const EnhancedSelect: React.FC<EnhancedSelectProps> = ({
  // Core props
  children,
  
  // Form attributes
  label,
  error,
  helper,
  placeholder,
  value,
  onValueChange,
  
  // Appearance
  variant = 'default',
  size = 'md',
  
  // Rest props
  ...rest
}) => {
  return (
    <FormFieldContainer>
      {label && (
        <Label>
          {label}
        </Label>
      )}
      <InputWrapper hasLeftIcon={false} hasRightIcon={false}>
        <select
          value={value}
          onChange={(e) => onValueChange?.(e.target.value)}
          style={{
            width: '100%',
            padding: size === 'sm' ? `${spacing.sm} ${spacing.md}` : 
                     size === 'lg' ? `${spacing.lg} ${spacing.xl}` : 
                     `${spacing.md} ${spacing.lg}`,
            fontSize: size === 'sm' ? fontSize.sm : 
                     size === 'lg' ? fontSize.lg : 
                     fontSize.md,
            border: `1px solid ${error ? colors.border.error : colors.border.default}`,
            borderRadius: borderRadius.default,
            backgroundColor: colors.background.primary,
            color: colors.text.primary,
            outline: 'none',
            transition: transitions.default,
            boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
      </InputWrapper>
      {error && (
        <ErrorMessage role="alert">
          {error}
        </ErrorMessage>
      )}
      {helper && !error && (
        <HelperMessage>
          {helper}
        </HelperMessage>
      )}
    </FormFieldContainer>
  );
};

export interface FormFieldProps {
  // Core props
  children: React.ReactNode;
  
  // Form attributes
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  
  // Rest props
  [key: string]: any;
}

export const FormField: React.FC<FormFieldProps> = ({ 
  // Core props
  children,
  
  // Form attributes
  label, 
  error, 
  helper, 
  required = false,
  
  // Rest props
  ...rest 
}) => {
  return (
    <FormFieldContainer {...rest}>
      {label && (
        <Label required={required}>
          {label}
        </Label>
      )}
      {children}
      {error && (
        <ErrorMessage role="alert">
          {error}
        </ErrorMessage>
      )}
      {helper && !error && (
        <HelperMessage>
          {helper}
        </HelperMessage>
      )}
    </FormFieldContainer>
  );
};

export interface SearchInputProps extends Omit<EnhancedInputProps, 'type'> {
  // Core props
  children?: React.ReactNode;
  
  // Behavior
  onSearch?: (value: string) => void;
  searchIcon?: React.ReactNode;
  
  // Rest props
  [key: string]: any;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  // Core props
  children,
  
  // Behavior
  onSearch,
  searchIcon,
  
  // Rest props
  ...props
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(e.currentTarget.value);
    }
  };

  return (
    <EnhancedInput
      type="search"
      rightIcon={searchIcon || <SearchIcon>🔍</SearchIcon>}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </EnhancedInput>
  );
};

export interface PhoneInputProps extends Omit<EnhancedInputProps, 'type'> {
  // Core props
  children?: React.ReactNode;
  
  // Form attributes
  countryCode?: string;
  
  // Rest props
  [key: string]: any;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  // Core props
  children,
  
  // Form attributes
  countryCode = '+1',
  
  // Rest props
  ...props
}) => {
  return (
    <EnhancedInput
      type="tel"
      leftIcon={<CountryCode>{countryCode}</CountryCode>}
      {...props}
    >
      {children}
    </EnhancedInput>
  );
}; 