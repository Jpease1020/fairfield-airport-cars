'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, transitions, shadows } from '../../system/tokens/tokens';

// Styled form components
const StyledInput = styled.input.withConfig({
  shouldForwardProp: (prop) => !['size', 'fullWidth', 'error', 'disabled'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
  fullWidth: boolean;
  error: boolean;
  disabled: boolean;
}>`
  display: block;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  border: 1px solid ${({ error }) => (error ? colors.border.error : colors.border.default)};
  border-radius: ${borderRadius.default};
  background-color: ${({ disabled }) => (disabled ? colors.background.disabled : colors.background.primary)};
  color: ${({ disabled }) => (disabled ? colors.text.disabled : colors.text.primary)};
  outline: none;
  transition: ${transitions.default};
  box-sizing: border-box;
  font-family: inherit;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'text')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

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
    border-color: ${colors.primary[600]};
    box-shadow: ${shadows.focus};
  }

  /* Error styles */
  ${({ error }) => error && `
    border-color: ${colors.border.error};
    box-shadow: ${shadows.error};
  `}
`;

const StyledSelect = styled.select.withConfig({
  shouldForwardProp: (prop) => !['size', 'fullWidth', 'error', 'disabled'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
  fullWidth: boolean;
  error: boolean;
  disabled: boolean;
}>`
  display: block;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  border: 1px solid ${({ error }) => (error ? colors.border.error : colors.border.default)};
  border-radius: ${borderRadius.default};
  background-color: ${({ disabled }) => (disabled ? colors.background.disabled : colors.background.primary)};
  color: ${({ disabled }) => (disabled ? colors.text.disabled : colors.text.primary)};
  outline: none;
  transition: ${transitions.default};
  box-sizing: border-box;
  font-family: inherit;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

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
    border-color: ${colors.primary[600]};
    box-shadow: ${shadows.focus};
  }

  /* Error styles */
  ${({ error }) => error && `
    border-color: ${colors.border.error};
    box-shadow: ${shadows.error};
  `}
`;

const StyledTextarea = styled.textarea.withConfig({
  shouldForwardProp: (prop) => !['size', 'error', 'disabled'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
  error: boolean;
  disabled: boolean;
}>`
  display: block;
  width: 100%;
  border: 1px solid ${({ error }) => (error ? colors.border.error : colors.border.default)};
  border-radius: ${borderRadius.default};
  background-color: ${({ disabled }) => (disabled ? colors.background.disabled : colors.background.primary)};
  color: ${({ disabled }) => (disabled ? colors.text.disabled : colors.text.primary)};
  outline: none;
  transition: ${transitions.default};
  box-sizing: border-box;
  font-family: inherit;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'text')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  resize: vertical;
  min-height: 3em;

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${spacing.sm} ${spacing.md};
          font-size: ${fontSize.sm};
        `;
      case 'md':
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.md};
        `;
      case 'lg':
        return `
          padding: ${spacing.lg} ${spacing.xl};
          font-size: ${fontSize.lg};
        `;
      default:
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.md};
        `;
    }
  }}

  /* Focus styles */
  &:focus {
    border-color: ${colors.primary[600]};
    box-shadow: ${shadows.focus};
  }

  /* Error styles */
  ${({ error }) => error && `
    border-color: ${colors.border.error};
    box-shadow: ${shadows.error};
  `}
`;

const StyledLabel = styled.label.withConfig({
  shouldForwardProp: (prop) => !['size'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
}>`
  display: block;
  font-weight: 500;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.xs};
  font-size: ${({ size }) => {
    switch (size) {
      case 'sm': return fontSize.sm;
      case 'md': return fontSize.md;
      case 'lg': return fontSize.lg;
      default: return fontSize.md;
    }
  }};
`;

// Reusable styled components
const StyledFormField = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
}>`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
  width: 100%;

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `gap: ${spacing.xs};`;
      case 'md':
        return `gap: ${spacing.sm};`;
      case 'lg':
        return `gap: ${spacing.md};`;
      default:
        return `gap: ${spacing.sm};`;
    }
  }}
`;

const StyledError = styled.div`
  color: ${colors.danger[600]};
  font-size: ${fontSize.sm};
  margin-top: ${spacing.xs};
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
`;

const StyledHelper = styled.div`
  color: ${colors.text.secondary};
  font-size: ${fontSize.sm};
  margin-top: ${spacing.xs};
`;

const StyledRequired = styled.span`
  color: ${colors.danger[600]};
`;

const StyledForm = styled.form`
  display: block;
  width: 100%;
`;



// Unified Input Component
export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'checkbox' | 'color' | 'datetime-local' | 'date';
  placeholder?: string;
  value?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  name?: string;
  id?: string;
  required?: boolean;
  [key: string]: any;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  size = 'md',
  fullWidth = false,
  name,
  id,
  required = false,
  ...rest
}) => {
  return (
    <StyledInput
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      name={name}
      id={id}
      required={required}
      size={size}
      fullWidth={fullWidth}
      error={error}
      aria-invalid={error}
      {...rest}
    />
  );
};

// Unified Select Component
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  name?: string;
  id?: string;
  required?: boolean;
  [key: string]: any;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  disabled = false,
  error = false,
  size = 'md',
  fullWidth = false,
  name,
  id,
  required = false,
  ...rest
}) => {
  return (
    <StyledSelect
      value={value}
      onChange={onChange}
      disabled={disabled}
      name={name}
      id={id}
      required={required}
      size={size}
      fullWidth={fullWidth}
      error={error}
      aria-invalid={error}
      {...rest}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </StyledSelect>
  );
};

// Unified Textarea Component
export interface TextareaProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  rows?: number;
  name?: string;
  id?: string;
  required?: boolean;
  [key: string]: any;
}

export const Textarea: React.FC<TextareaProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  error = false,
  size = 'md',
  rows = 3,
  name,
  id,
  required = false,
  ...rest
}) => {
  return (
    <StyledTextarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      name={name}
      id={id}
      required={required}
      size={size}
      error={error}
      aria-invalid={error}
      {...rest}
    />
  );
};

// Form Field Wrapper
export interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  [key: string]: any;
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  error,
  helperText,
  required = false,
  size = 'md',
  ...rest
}) => {
  return (
    <StyledFormField size={size} {...rest}>
      {label && (
        <StyledLabel size={size}>
          {label}
          {required && <StyledRequired> *</StyledRequired>}
        </StyledLabel>
      )}
      {children}
      {error && (
        <StyledError role="alert">
          {error}
        </StyledError>
      )}
      {helperText && !error && (
        <StyledHelper>
          {helperText}
        </StyledHelper>
      )}
    </StyledFormField>
  );
};

// Form Container
export interface FormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  method?: 'get' | 'post';
  action?: string;
  noValidate?: boolean;
  [key: string]: any;
}

export const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  method = 'post',
  action,
  noValidate = false,
  ...rest
}) => {
  return (
    <StyledForm
      onSubmit={onSubmit}
      method={method}
      action={action}
      noValidate={noValidate}
      {...rest}
    >
      {children}
    </StyledForm>
  );
}; 