'use client';

import React from 'react';
import { Container } from '@/ui';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Container variant="default" padding="none">
      {children}
    </Container>
  );
}; 