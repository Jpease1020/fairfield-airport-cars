import * as React from 'react';
import { cn } from '@/lib/utils/utils';
import { Container, H3, Text, Grid } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

// FormSection Component - BULLETPROOF TYPE SAFETY!
interface FormSectionProps {
  title: string;
  description?: string;
  columns?: number;
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'card' | 'minimal';
}

const FormSection: React.FC<FormSectionProps> = ({ 
    title, 
    description, 
    columns = 1, 
    children, 
    spacing = 'lg', 
    variant = 'default' 
  }) => {
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