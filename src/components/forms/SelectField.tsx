import * as React from 'react';
import { cn } from '@/lib/utils/utils';
import { Label } from '@/components/ui/label';
import { Select, Option, Text } from '@/components/ui';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  required?: boolean;
}

const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ className, label, options, error, helperText, required, id, ...props }, ref) => {
    const fieldId = id || (typeof label === 'string' ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : 'select-unknown');

    return (
      <div className="">
        <Label htmlFor={fieldId} className="">
          {label}
          {required && <span className="">*</span>}
        </Label>
        <Select
          ref={ref}
          id={fieldId}
          className={cn(
            'flex h-10 w-full rounded-md border border-border-primary bg-bg-primary px-3 py-2 text-sm text-text-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error focus-visible:ring-error',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <Option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </Option>
          ))}
        </Select>
        {error && (
          <Text className="">{error}</Text>
        )}
        {helperText && !error && (
          <Text className="">{helperText}</Text>
        )}
      </div>
    );
  }
);
SelectField.displayName = 'SelectField';

export { SelectField }; 