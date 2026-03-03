'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, transitions, shadows } from '../../../system/tokens/tokens';

// Styled Input component with flexbox
const StyledInput = styled.input.withConfig({
  shouldForwardProp: (prop) => !['size', 'fullWidth', 'error', 'disabled'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
  fullWidth: boolean;
  error: boolean;
  disabled: boolean;
}>`
  display: flex;
  align-items: center;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  min-width: 0; /* Allow flexbox shrinking */
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
  flex: ${({ fullWidth }) => (fullWidth ? '1' : 'none')};

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${spacing.sm} ${spacing.md};
          font-size: ${fontSize.sm};
          height: 2rem;
          min-height: 2rem;
        `;
      case 'md':
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.md};
          height: 2.5rem;
          min-height: 2.5rem;
        `;
      case 'lg':
        return `
          padding: ${spacing.lg} ${spacing.xl};
          font-size: ${fontSize.lg};
          height: 3rem;
          min-height: 3rem;
        `;
      default:
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.md};
          height: 3rem;
          min-height: 3rem;
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

  /* Mobile-specific date and time input styling */
  &[type="date"],
  &[type="time"],
  &[type="datetime-local"] {
    cursor: pointer;
    
    /* iOS Safari specific fixes - preserve native appearance */
    @media (max-width: 768px) {
      font-size: 16px; /* Prevent zoom on iOS */
      /* Don't remove appearance - let native pickers show */
      -webkit-appearance: menulist-button;
      appearance: menulist-button;
      
      /* Ensure proper padding for native pickers - extra space for indicator */
      padding-right: 50px !important;
      
      /* Ensure the input is tappable and shows picker */
      &:focus {
        outline: none;
        border-color: ${colors.primary[600]};
      }
      
      /* Style the native picker text */
      &::-webkit-datetime-edit {
        padding: 0;
        color: ${colors.text.primary};
        padding-right: 8px; /* Add space between text and indicator */
      }
      
      &::-webkit-datetime-edit-fields-wrapper {
        padding: 0;
      }
      
      &::-webkit-datetime-edit-text {
        color: ${colors.text.primary};
        padding: 0 2px;
      }
      
      &::-webkit-datetime-edit-month-field,
      &::-webkit-datetime-edit-day-field,
      &::-webkit-datetime-edit-year-field,
      &::-webkit-datetime-edit-hour-field,
      &::-webkit-datetime-edit-minute-field {
        color: ${colors.text.primary};
        padding: 0 2px;
      }
      
      /* Calendar/time picker indicator - position to the right with proper spacing */
      &::-webkit-calendar-picker-indicator {
        opacity: 1 !important;
        cursor: pointer;
        width: 24px !important;
        height: 24px !important;
        padding: 4px !important;
        margin-left: 8px !important;
        margin-right: 8px !important;
        display: inline-block !important;
        visibility: visible !important;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        position: absolute;
        right: 8px;
        /* Force visibility on iOS */
        -webkit-appearance: menulist-button;
        appearance: menulist-button;
      }
      
      /* For time inputs, show the clock icon */
      &[type="time"]::-webkit-calendar-picker-indicator {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpolyline points='12 6 12 12 16 14'%3E%3C/polyline%3E%3C/svg%3E");
        opacity: 1 !important;
        visibility: visible !important;
      }
      
      /* For date inputs, ensure calendar icon is visible */
      &[type="date"]::-webkit-calendar-picker-indicator {
        opacity: 1 !important;
        visibility: visible !important;
      }
    }
    
    /* Desktop styling - cleaner appearance */
    @media (min-width: 769px) {
      &::-webkit-calendar-picker-indicator {
        opacity: 0.7;
        cursor: pointer;
        width: 20px;
        height: 20px;
        padding: 4px;
        margin-left: 8px;
      }
      
      &:hover::-webkit-calendar-picker-indicator {
        opacity: 1;
      }
    }
  }

  /* Responsive behavior */
  @media (max-width: 768px) {
    ${({ size }) => {
      if (size === 'lg') {
        return `
          padding: ${spacing.md} ${spacing.lg};
          font-size: ${fontSize.md};
          height: 3rem;
          min-height: 3rem;
        `;
      }
      return '';
    }}
  }

  @media (max-width: 640px) {
    ${({ size }) => {
      if (size === 'md' || size === 'lg') {
        return `
          padding: ${spacing.sm} ${spacing.md};
          font-size: ${fontSize.sm};
          height: 3rem;
          min-height: 3rem;
        `;
      }
      return '';
    }}
  }
`;

// Input Component
export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'checkbox' | 'color' | 'datetime-local' | 'date' | 'time';
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
  cmsKeyLabel?: string; // optional, if label is separate we still can map placeholder
  cmsKeyPlaceholder?: string;
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
  cmsKeyLabel,
  cmsKeyPlaceholder,
  ...rest
}) => {
  const ref = React.useRef<HTMLInputElement | null>(null);
  // Register placeholder if present (counts as editable copy)
  // useRegisterContent(Boolean(placeholder), { role: 'placeholder', value: placeholder, cmsPath: cmsKeyPlaceholder, element: ref.current });
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
      ref={ref}
      {...rest}
    />
  );
}; 
