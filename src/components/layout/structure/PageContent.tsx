import React from 'react';
import { Container } from '@/components/ui';

interface PageContentProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const PageContent: React.FC<PageContentProps> = ({
  children,
  padding = 'lg',
  margin = 'none'
}) => {
  return (
    <Container
      padding={padding}
      margin={margin}
    >
      {children}
    </Container>
  );
};

PageContent.displayName = 'PageContent'; 