import * as React from 'react';
import { cn } from '@/lib/utils/utils';
import { Container, H3, Text, Grid } from '@/components/ui';

interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  columns?: number;
  children: React.ReactNode;
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ className, title, description, columns, children, ...props }, ref) => {
    return (
      <Container
        className={cn('space-y-4 p-6 border border-border-primary rounded-lg bg-bg-primary', className)}
        {...props}
      >
        <div>
          <H3 className="">{title}</H3>
          {description && (
            <Text className="">{description}</Text>
          )}
        </div>
        <Grid 
          columns={(columns as 1 | 2 | 3 | 4 | 6) || 1} 
          spacing="md" 
          className={cn('space-y-4', columns && `grid grid-cols-1 md:grid-cols-${columns} gap-4`)}
        >
          {children}
        </Grid>
      </Container>
    );
  }
);
FormSection.displayName = 'FormSection';

export { FormSection }; 