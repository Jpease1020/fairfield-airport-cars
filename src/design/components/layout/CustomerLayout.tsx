'use client';

import React from 'react';
import { Container, CustomerNavigation, CustomerFooter } from '@/design/ui';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  return (
    <>
      {/* Navigation */}
      <Container maxWidth="full" padding="md" variant="navigation" as="header" data-testid="customer-navigation">
        <CustomerNavigation />
      </Container>

      {/* Main Content */}
      <main data-testid="customer-main-content">
        {children}
      </main>

      {/* Footer */}
      <footer data-testid="customer-footer">
        <CustomerFooter />
      </footer>
    </>
  );
}; 