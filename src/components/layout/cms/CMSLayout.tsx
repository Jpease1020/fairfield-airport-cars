import React from 'react';
import { Container } from '@/components/ui';

interface CMSLayoutProps {
  children: React.ReactNode;
  variant?: 'standard' | 'marketing' | 'portal' | 'admin' | 'conversion' | 'content' | 'status';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const CMSLayout: React.FC<CMSLayoutProps> = ({
  children,
  variant = 'standard',
  maxWidth = 'xl',
  padding = 'lg'
}) => {
  return (
    <Container 
      variant="main"
      maxWidth={maxWidth}
      padding={padding}
      as="div"
    >
      <Container as="main" variant="content">
        {children}
      </Container>
    </Container>
  );
};

CMSLayout.displayName = 'CMSLayout'; 