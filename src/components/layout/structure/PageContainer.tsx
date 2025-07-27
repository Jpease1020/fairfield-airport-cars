import * as React from 'react';
import { Container } from '@/components/ui';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PageContainer: React.FC<PageContainerProps> = ({
  maxWidth = 'full', 
  padding = 'md', 
  children
}) => {
  return (
    <Container
      maxWidth={maxWidth}
      padding={padding}
    >
      {children}
    </Container>
  );
};
PageContainer.displayName = 'PageContainer';

export { PageContainer }; 