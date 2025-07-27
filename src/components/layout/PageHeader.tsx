import * as React from 'react';
import { Container, H1, Text } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  children,
  spacing = 'lg',
  maxWidth = 'xl'
}) => {
  return (
    <Container maxWidth={maxWidth} spacing={spacing}>
      <Stack spacing="md">
        <Stack spacing="sm">
          <H1>{title}</H1>
          {subtitle && (
            <Text>{subtitle}</Text>
          )}
        </Stack>
        {children && (
          <div>
            {children}
          </div>
        )}
      </Stack>
    </Container>
  );
};

PageHeader.displayName = 'PageHeader';

export { PageHeader }; 