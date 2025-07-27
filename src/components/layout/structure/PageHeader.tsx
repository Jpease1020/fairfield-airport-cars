import React from 'react';
import { Container, H1, Text } from '@/components/ui';

interface PageHeaderProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  align?: 'left' | 'center' | 'right';
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  children,
  title,
  subtitle,
  padding = 'lg',
  margin = 'none'
}) => {
  return (
    <Container as="header" padding={padding} margin={margin}>
      {title && (
        <H1>
          {title}
        </H1>
      )}
      {subtitle && (
        <Text>
          {subtitle}
        </Text>
      )}
      {children}
    </Container>
  );
};

PageHeader.displayName = 'PageHeader'; 