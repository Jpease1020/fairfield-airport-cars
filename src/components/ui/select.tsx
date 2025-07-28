'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, shadows, transitions, zIndex } from '@/lib/design-system/tokens';

// Styled select trigger with enhanced accessibility
const StyledSelectTrigger = styled.button.withConfig({
  shouldForwardProp: (prop) => !['size', 'fullWidth', 'error', 'open', 'variant'].includes(prop)
})<{
  size: 'sm' | 'md' | 'lg';
  fullWidth: boolean;
  error: boolean;
  open: boolean;
  variant: 'default' | 'outlined' | 'filled';
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  border: 1px solid ${({ error, variant }) => {
    if (error) return colors.border.error;
    if (variant === 'outlined') return colors.border.default;
    return 'transparent';
  }};
  border-radius: ${borderRadius.default};
  background-color: ${({ variant }) => variant === 'filled' ? colors.background.secondary : colors.background.primary};
  color: ${colors.text.primary};
  outline: none;
  transition: ${transitions.default};
  box-sizing: border-box;
  font-family: inherit;
  cursor: pointer;
  box-shadow: ${({ variant }) => variant === 'filled' ? shadows.sm : 'none'};

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

  /* Hover styles */
  &:hover:not(:disabled) {
    border-color: ${({ error }) => (error ? colors.border.error : colors.primary[500])};
  }

  /* Disabled styles */
  &:disabled {
    background-color: ${colors.background.disabled};
    color: ${colors.text.disabled};
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* Open state */
  ${({ open }) => open && `
    border-color: ${colors.primary[600]};
    box-shadow: ${shadows.focus};
  `}

  /* Error styles */
  ${({ error }) => error && `
    border-color: ${colors.border.error};
    
    &:focus {
      border-color: ${colors.border.error};
      box-shadow: ${shadows.error};
    }
  `}
`;

// Styled select value with improved typography
const SelectValue = styled.span<{ placeholder: boolean; size: 'sm' | 'md' | 'lg' }>`
  color: ${({ placeholder }) => (placeholder ? colors.text.secondary : colors.text.primary)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `font-size: ${fontSize.sm};`;
      case 'md':
        return `font-size: ${fontSize.md};`;
      case 'lg':
        return `font-size: ${fontSize.lg};`;
      default:
        return `font-size: ${fontSize.md};`;
    }
  }}
`;

// Styled select icon with enhanced styling
const SelectIcon = styled.span<{ open: boolean; size: 'sm' | 'md' | 'lg' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: ${spacing.sm};
  transition: ${transitions.default};
  transform: ${({ open }) => (open ? 'rotate(180deg)' : 'rotate(0deg)')};
  color: ${colors.text.secondary};
  
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `font-size: 0.625rem;`;
      case 'md':
        return `font-size: 0.75rem;`;
      case 'lg':
        return `font-size: 0.875rem;`;
      default:
        return `font-size: 0.75rem;`;
    }
  }}
  
  &::after {
    content: '▼';
  }
`;

// Styled select content with enhanced positioning
const SelectContent = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size', 'position'].includes(prop)
})<{ size: 'sm' | 'md' | 'lg'; position: 'top' | 'bottom' }>`
  position: absolute;
  ${({ position }) => position === 'top' ? 'bottom: 100%' : 'top: 100%'};
  left: 0;
  right: 0;
  z-index: ${zIndex.dropdown};
  background-color: ${colors.background.primary};
  border: 1px solid ${colors.border.default};
  border-radius: ${borderRadius.default};
  box-shadow: ${shadows.lg};
  max-height: 200px;
  overflow-y: auto;
  margin-top: ${({ position }) => position === 'top' ? '0' : '2px'};
  margin-bottom: ${({ position }) => position === 'top' ? '2px' : '0'};
  animation: ${({ position }) => position === 'top' ? 'slideUp' : 'slideDown'} 0.2s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Size styles */
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `font-size: ${fontSize.sm};`;
      case 'md':
        return `font-size: ${fontSize.md};`;
      case 'lg':
        return `font-size: ${fontSize.lg};`;
      default:
        return `font-size: ${fontSize.md};`;
    }
  }}

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${colors.background.secondary};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${colors.border.default};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${colors.border.dark};
  }
`;

// Styled select item with enhanced interactions
const SelectItem = styled.div.withConfig({
  shouldForwardProp: (prop) => !['selected', 'disabled', 'size'].includes(prop)
})<{
  selected: boolean;
  disabled: boolean;
  size: 'sm' | 'md' | 'lg';
}>`
  display: flex;
  align-items: center;
  padding: ${spacing.sm} ${spacing.md};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: ${transitions.default};
  color: ${({ disabled }) => (disabled ? colors.text.disabled : colors.text.primary)};
  background-color: ${({ selected }) => (selected ? colors.primary[50] : 'transparent')};
  
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `min-height: 1.75rem;`;
      case 'md':
        return `min-height: 2rem;`;
      case 'lg':
        return `min-height: 2.5rem;`;
      default:
        return `min-height: 2rem;`;
    }
  }}

  &:hover:not(:disabled) {
    background-color: ${({ selected }) => (selected ? colors.primary[100] : colors.gray[50])};
  }

  &:focus {
    outline: none;
    background-color: ${colors.primary[100]};
  }

  /* Selected indicator */
  ${({ selected }) => selected && `
    &::before {
      content: '✓';
      margin-right: ${spacing.sm};
      color: ${colors.primary[600]};
      font-weight: bold;
    }
  `}
`;

// Styled select container with improved positioning
const SelectContainer = styled.div<{ fullWidth: boolean }>`
  position: relative;
  display: inline-block;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

// Styled error message
const ErrorMessage = styled.div<{ size: 'sm' | 'md' | 'lg' }>`
  color: ${colors.danger[600]};
  font-size: ${({ size }) => {
    switch (size) {
      case 'sm': return fontSize.xs;
      case 'md': return fontSize.sm;
      case 'lg': return fontSize.md;
      default: return fontSize.sm;
    }
  }};
  margin-top: ${spacing.xs};
  display: block;
`;

export interface SelectProps {
  // Core props
  children?: React.ReactNode;
  
  // State
  value?: string;
  defaultValue?: string;
  
  // Options
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  
  // Appearance
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  variant?: 'default' | 'outlined' | 'filled';
  
  // States
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  
  // Content
  placeholder?: string;
  
  // Events
  onValueChange?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
  
  // HTML attributes
  name?: string;
  id?: string;
  required?: boolean;
  
  // Rest props
  [key: string]: any;
}

export const Select: React.FC<SelectProps> = React.forwardRef<HTMLButtonElement, SelectProps>(({
  // Core props
  children,
  
  // State
  value,
  defaultValue,
  
  // Options
  options,
  
  // Appearance
  size = 'md',
  fullWidth = false,
  variant = 'default',
  
  // States
  disabled = false,
  error = false,
  errorMessage,
  
  // Content
  placeholder = 'Select an option...',
  
  // Events
  onValueChange,
  onChange,
  
  // Accessibility
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  
  // HTML attributes
  name,
  id,
  required = false,
  
  // Rest props
  ...rest
}, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || '');
  const [internalValue, setInternalValue] = React.useState(value || defaultValue || '');
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  
  const selectedOption = options.find((option: { value: string; label: string; disabled?: boolean }) => option.value === currentValue);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    setFocusedIndex(-1);
  };

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    
    const newValue = optionValue;
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    setSelectedValue(newValue);
    setIsOpen(false);
    setFocusedIndex(-1);
    onValueChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const nextIndex = Math.min(focusedIndex + 1, options.length - 1);
          setFocusedIndex(nextIndex);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          const prevIndex = Math.max(focusedIndex - 1, 0);
          setFocusedIndex(prevIndex);
        }
        break;
    }
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, optionValue: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(optionValue);
    }
  };

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && !(e.target as Element).closest('[data-select]')) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  // Determine dropdown position
  const [dropdownPosition, setDropdownPosition] = React.useState<'top' | 'bottom'>('bottom');
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = Math.min(200, options.length * 40); // Approximate height
      
      setDropdownPosition(spaceBelow < dropdownHeight && spaceAbove > spaceBelow ? 'top' : 'bottom');
    }
  }, [isOpen, options.length]);

  return (
    <SelectContainer ref={containerRef} fullWidth={fullWidth} data-select>
      <StyledSelectTrigger
        ref={ref}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        disabled={disabled}
        size={size}
        fullWidth={fullWidth}
        error={error}
        open={isOpen}
        variant={variant}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        name={name}
        id={id}
        aria-invalid={error}
        {...rest}
      >
        <SelectValue placeholder={!selectedOption} size={size}>
          {displayValue}
        </SelectValue>
        <SelectIcon open={isOpen} size={size} />
      </StyledSelectTrigger>
      
      {isOpen && (
        <SelectContent size={size} position={dropdownPosition}>
          {options.map((option: { value: string; label: string; disabled?: boolean }, index: number) => (
            <SelectItem
              key={option.value}
              selected={option.value === currentValue}
              disabled={option.disabled || false}
              size={size}
              onClick={() => handleSelect(option.value)}
              onKeyDown={(e) => handleItemKeyDown(e, option.value)}
              role="option"
              aria-selected={option.value === currentValue}
              tabIndex={focusedIndex === index ? 0 : -1}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      )}
      
      {error && errorMessage && (
        <ErrorMessage 
          size={size}
          role="alert"
          aria-live="polite"
        >
          {errorMessage}
        </ErrorMessage>
      )}
    </SelectContainer>
  );
});

Select.displayName = 'Select';
