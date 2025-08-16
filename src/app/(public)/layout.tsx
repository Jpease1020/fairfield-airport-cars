'use client';

import React from 'react';
import { Container } from '@/design/layout/containers/Container';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Container as="main" maxWidth="full" data-testid="layout-main-content">
        {children}
      </Container>
    </div>
  );
} 