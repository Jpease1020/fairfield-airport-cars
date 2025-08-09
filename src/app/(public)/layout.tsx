'use client';

import React from 'react';
import { CustomerNavigation } from '@/components/app/CustomerNavigation';
import { Container } from '@/design/layout/containers/Container';
import { Footer } from '@/design/page-sections/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Container variant="navigation" as="header" maxWidth="full" margin="none" data-testid="layout-navigation" padding="none"> 
        <CustomerNavigation />
      </Container>
      
      <Container as="main" maxWidth="full" data-testid="layout-main-content">
        {children}
      </Container>

      <Footer data-testid="layout-footer"/>
    </div>
  );
} 