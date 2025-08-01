'use client';

import React from 'react';
import { Container } from '@/ui';

interface SimpleLayoutProps {
  children: React.ReactNode;
}

export const SimpleLayout: React.FC<SimpleLayoutProps> = ({ children }) => {
  return (
    <Container variant="default" padding="none">
      {children}
    </Container>
  );
}; 