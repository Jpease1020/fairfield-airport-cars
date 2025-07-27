import React from 'react';
import { Container } from '@/components/ui';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      {children}
    </Container>
  );
} 