'use client';

import React from 'react';
import { Container, Stack } from '@/ui';
import { CustomerNavigation } from './CustomerNavigation';
import { CustomerFooter } from './CustomerFooter';

interface StandardLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
}

export const StandardLayout: React.FC<StandardLayoutProps> = ({ 
  children, 
  showNavigation = true, 
  showFooter = true 
}) => {
  return (
    <Container as="div" maxWidth="full">
      <Stack spacing="none" fullWidth>
        {/* Navigation */}
        {showNavigation && (
          <Container variant="navigation" as="header">
            <CustomerNavigation />
          </Container>
        )}

        {/* Main Content */}
        <Container as="main" maxWidth="full">
          {children}
        </Container>

        {/* Footer */}
        {showFooter && (
          <Container variant="navigation" as="footer">
            <CustomerFooter />
          </Container>
        )}
      </Stack>
    </Container>
  );
}; 