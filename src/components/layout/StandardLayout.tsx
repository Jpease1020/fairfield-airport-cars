import React from 'react';
import { StandardHeader } from './StandardHeader';
import { StandardFooter } from './StandardFooter';
import { StandardNavigation } from './StandardNavigation';
import { Container } from '@/components/ui';

interface StandardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showNavigation?: boolean;
  variant?: 'default' | 'compact' | 'wide';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const StandardLayout: React.FC<StandardLayoutProps> = ({
  children,
  title,
  subtitle,
  showHeader = true,
  showFooter = true,
  showNavigation = true,
  variant = 'default',
  maxWidth = 'xl'
}) => {
  return (
    <Container variant={variant} maxWidth={maxWidth}>
      {showNavigation && <StandardNavigation />}
      
      <Container variant="main">
        {showHeader && (title || subtitle) && (
          <StandardHeader title={title} subtitle={subtitle} />
        )}
        
        <Container variant="content">
          {children}
        </Container>
      </Container>
      
      {showFooter && <StandardFooter />}
    </Container>
  );
}; 