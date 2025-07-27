import * as React from 'react';
import { cn } from '@/lib/utils/utils';
import { Label } from '@/components/ui/label';
import { Select, Option, Text, Container } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

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
      <Container>
        <Stack spacing="sm">
          <Label htmlFor={fieldId}>
            {label}
            {required && <span>*</span>}
          </Label>
          <Select
            ref={ref}
            id={fieldId}
            className={className}
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
            <Text>{error}</Text>
          )}
          {helperText && !error && (
            <Text>{helperText}</Text>
          )}
        </Stack>
      </Container>
    );
  }
);
SelectField.displayName = 'SelectField';

export { SelectField }; 