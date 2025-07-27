import * as React from 'react';
import { cn } from '@/lib/utils/utils';
import { Container, H3, Text, Grid } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

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
        className={className}
        {...props}
      >
        <Stack spacing="md">
          <Container>
            <H3>{title}</H3>
            {description && (
              <Text>{description}</Text>
            )}
          </Container>
          <Grid 
            columns={(columns as 1 | 2 | 3 | 4 | 6) || 1} 
            spacing="md"
          >
            {children}
          </Grid>
        </Stack>
      </Container>
    );
  }
);
FormSection.displayName = 'FormSection';

export { FormSection }; 