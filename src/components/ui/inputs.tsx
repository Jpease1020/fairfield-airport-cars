import React from 'react';
import { Container, Text, Span } from '@/components/ui';
import { Stack } from '@/components/ui/containers';
import { Input } from './input';
import { Textarea } from './textarea';
import { Label } from './form';

// Enhanced Input Component
interface EnhancedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helper?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ label, error, helper, leftIcon, rightIcon, ...props }, ref) => {

      return (
    <Stack spacing="sm">
      {label && (
        <Label>
          {label}
        </Label>
      )}
      <Container>
        {leftIcon && (
          <Container>
            {leftIcon}
          </Container>
        )}
        <Input
          ref={ref}
          {...(props as any)}
        />
        {rightIcon && (
          <Container>
            {rightIcon}
          </Container>
        )}
      </Container>
      {error && (
        <Text size="sm">{error}</Text>
      )}
      {helper && !error && (
        <Text size="sm">{helper}</Text>
      )}
    </Stack>
  );
  }
);
EnhancedInput.displayName = 'EnhancedInput';

// Enhanced Textarea Component
interface EnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

const EnhancedTextarea = React.forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  ({ label, error, helper, ...props }, ref) => {

    return (
      <Stack spacing="sm">
        {label && (
          <Label>
            {label}
          </Label>
        )}
        <Textarea
          ref={ref}
          {...(props as any)}
        />
        {error && (
          <Text size="sm">{error}</Text>
        )}
        {helper && !error && (
          <Text size="sm">{helper}</Text>
        )}
      </Stack>
    );
  }
);
EnhancedTextarea.displayName = 'EnhancedTextarea';

// Enhanced Select Component
interface EnhancedSelectProps {
  label?: string;
  error?: string;
  helper?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const EnhancedSelect: React.FC<EnhancedSelectProps> = ({
  label,
  error,
  helper,
  placeholder,
  value,
  onValueChange,
  children,
}) => {

  return (
    <Stack spacing="sm">
      {label && (
        <Label>
          {label}
        </Label>
      )}
      <Container>
        <select
          value={value}
          onChange={(e) => onValueChange?.(e.target.value)}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
      </Container>
      {error && (
        <Text size="sm">{error}</Text>
      )}
      {helper && !error && (
        <Text size="sm">{helper}</Text>
      )}
    </Stack>
  );
};

// Form Field Component
interface FormFieldProps {
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, error, helper, required, children }) => {
  return (
    <Stack spacing="sm">
      {label && (
        <Label required={required}>
          {label}
        </Label>
      )}
      {children}
      {error && (
        <Text size="sm" variant="muted">
          {error}
        </Text>
      )}
      {helper && !error && (
        <Text size="sm" variant="muted">
          {helper}
        </Text>
      )}
    </Stack>
  );
};

// Search Input Component
interface SearchInputProps extends Omit<EnhancedInputProps, 'type'> {
  onSearch?: (value: string) => void;
  searchIcon?: React.ReactNode;
}

const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  searchIcon,
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
      rightIcon={searchIcon || <Span>🔍</Span>}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
};

// Phone Input Component
interface PhoneInputProps extends Omit<EnhancedInputProps, 'type'> {
  countryCode?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  countryCode = '+1',
  ...props
}) => {
  return (
    <EnhancedInput
      type="tel"
      leftIcon={<Span>{countryCode}</Span>}
      {...props}
    />
  );
};

export {
  EnhancedInput,
  EnhancedTextarea,
  EnhancedSelect,
  FormField,
  SearchInput,
  PhoneInput
}; 