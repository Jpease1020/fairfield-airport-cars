import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label, Text } from '@/components/ui';
import { cn } from '@/lib/utils/utils';

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
      sm: 'text-sm p-3',
      md: 'text-base p-4',
      lg: 'text-lg p-4'
    };

    const inputClasses = cn(
      'w-full transition-colors duration-200',
      variantClasses[variant],
      sizeClasses[size],
      error && 'border-error focus:border-error',
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      className
    );

    return (
      <div >
        {label && (
          <Label>
            {label}
          </Label>
        )}
        <div >
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              {leftIcon}
            </div>
          )}
          <Input
            className={inputClasses}
            {...(props as any)}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <Text size="sm">{error}</Text>
        )}
        {helper && !error && (
          <Text size="sm">{helper}</Text>
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
      <div >
        {label && (
          <Label>
            {label}
          </Label>
        )}
        <Textarea
          className={textareaClasses}
          {...(props as any)}
        />
        {error && (
          <Text size="sm">{error}</Text>
        )}
        {helper && !error && (
          <Text size="sm">{helper}</Text>
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
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const EnhancedSelect: React.FC<EnhancedSelectProps> = ({
  label,
  error,
  helper,
  placeholder,
  value,
  onValueChange,
  children,
  variant = 'default',
  size = 'md',
  className
}) => {
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

  const selectClasses = cn(
    'w-full transition-colors duration-200',
    variantClasses[variant],
    sizeClasses[size],
    error && 'border-error focus:border-error',
    className
  );

  return (
    <div >
      {label && (
        <Label>
          {label}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={selectClasses}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
      {error && (
        <Text size="sm">{error}</Text>
      )}
      {helper && !error && (
        <Text size="sm">{helper}</Text>
      )}
    </div>
  );
};

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
        <Label>
          {label}
          {required && <span>*</span>}
        </Label>
      )}
      {children}
      {error && (
        <Text size="sm">{error}</Text>
      )}
      {helper && !error && (
        <Text size="sm">{helper}</Text>
      )}
    </div>
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
    if (e.key === 'Enter' && onSearch) {
      onSearch(e.currentTarget.value);
    }
  };

  return (
    <EnhancedInput
      type="search"
      onKeyDown={handleKeyDown}
      leftIcon={searchIcon || (
        <svg  fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )}
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
      leftIcon={
        <span>{countryCode}</span>
      }
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