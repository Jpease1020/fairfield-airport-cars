'use client';

import React from 'react';
import { Container } from '../layout/containers/Container';
import { Stack } from '../layout/grid/Stack';
import { CustomerNavigation } from '../page-sections/CustomerNavigation';
import { CustomerFooter } from '../page-sections/Footer';

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
      <Stack spacing="none">
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