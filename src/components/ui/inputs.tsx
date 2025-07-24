import React from 'react';
import { cn } from '@/lib/utils/utils';
import { Input } from './input';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectTrigger, SelectValue } from './select';

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
  ({ className, label, error, helper, variant = 'default', size = 'md', leftIcon, rightIcon, ...props }, ref) => {
    const variantClasses = {
      default: 'border-border-primary focus:border-brand-primary',
      filled: 'bg-bg-secondary border-border-primary focus:border-brand-primary',
      outlined: 'border-2 border-border-primary focus:border-brand-primary'
    };

    const sizeClasses = {
      sm: 'h-8 text-sm px-3',
      md: 'h-10 text-base px-4',
      lg: 'h-12 text-lg px-4'
    };

    const inputClasses = cn(
      'w-full transition-colors duration-200',
      variantClasses[variant],
      sizeClasses[size],
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      error && 'border-error focus:border-error',
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">
              {leftIcon}
            </div>
          )}
          <Input
            ref={ref}
            className={inputClasses}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
        {helper && !error && (
          <p className="mt-1 text-sm text-text-muted">{helper}</p>
        )}
      </div>
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
  ({ className, label, error, helper, variant = 'default', size = 'md', ...props }, ref) => {
    const variantClasses = {
      default: 'border-border-primary focus:border-brand-primary',
      filled: 'bg-bg-secondary border-border-primary focus:border-brand-primary',
      outlined: 'border-2 border-border-primary focus:border-brand-primary'
    };

    const sizeClasses = {
      sm: 'text-sm p-3',
      md: 'text-base p-4',
      lg: 'text-lg p-4'
    };

    const textareaClasses = cn(
      'w-full transition-colors duration-200',
      variantClasses[variant],
      sizeClasses[size],
      error && 'border-error focus:border-error',
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-2">
            {label}
          </label>
        )}
        <Textarea
          ref={ref}
          className={textareaClasses}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
        {helper && !error && (
          <p className="mt-1 text-sm text-text-muted">{helper}</p>
        )}
      </div>
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
  children: React.ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const EnhancedSelect = React.forwardRef<HTMLButtonElement, EnhancedSelectProps>(
  ({ className, label, error, helper, placeholder, value, onValueChange, children, disabled, size = 'md' }) => {
    const sizeClasses = {
      sm: 'h-8 text-sm',
      md: 'h-10 text-base',
      lg: 'h-12 text-lg'
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-2">
            {label}
          </label>
        )}
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger className={cn(sizeClasses[size], error && 'border-error', className)}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {children}
          </SelectContent>
        </Select>
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
        {helper && !error && (
          <p className="mt-1 text-sm text-text-muted">{helper}</p>
        )}
      </div>
    );
  }
);
EnhancedSelect.displayName = 'EnhancedSelect';

// Form Field Component
interface FormFieldProps {
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, error, helper, required, children, className }) => {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
      {helper && !error && (
        <p className="mt-1 text-sm text-text-muted">{helper}</p>
      )}
    </div>
  );
};

// Search Input Component
interface SearchInputProps extends Omit<EnhancedInputProps, 'type'> {
  onSearch?: (value: string) => void;
  searchIcon?: React.ReactNode;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch(e.currentTarget.value);
      }
    };

    return (
      <EnhancedInput
        ref={ref}
        type="search"
        placeholder="Search..."
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);
SearchInput.displayName = 'SearchInput';

// Phone Input Component
interface PhoneInputProps extends Omit<EnhancedInputProps, 'type'> {
  countryCode?: string;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ countryCode = '+1', ...props }, ref) => {
    return (
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted text-sm">
          {countryCode}
        </div>
        <EnhancedInput
          ref={ref}
          type="tel"
          className="pl-12"
          {...props}
        />
      </div>
    );
  }
);
PhoneInput.displayName = 'PhoneInput';

// Email Input Component
const EmailInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  (props, ref) => {
    return <EnhancedInput ref={ref} type="email" {...props} />;
  }
);
EmailInput.displayName = 'EmailInput';

// Password Input Component
const PasswordInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  (props, ref) => {
    return <EnhancedInput ref={ref} type="password" {...props} />;
  }
);
PasswordInput.displayName = 'PasswordInput';

// Number Input Component
const NumberInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  (props, ref) => {
    return <EnhancedInput ref={ref} type="number" {...props} />;
  }
);
NumberInput.displayName = 'NumberInput';

// URL Input Component
const URLInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  (props, ref) => {
    return <EnhancedInput ref={ref} type="url" {...props} />;
  }
);
URLInput.displayName = 'URLInput';

export {
  EnhancedInput,
  EnhancedTextarea,
  EnhancedSelect,
  FormField,
  SearchInput,
  PhoneInput,
  EmailInput,
  PasswordInput,
  NumberInput,
  URLInput
}; 