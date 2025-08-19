'use client';

import React from 'react';
import { Container } from '@/design/layout/containers/Container';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Container as="main" maxWidth="full" data-testid="layout-main-content">
        {children}
      </Container>
    </>
  );
}