import React from 'react';
import { Container, H1, H2 } from '@/components/ui';

interface StandardHeaderProps {
  title: string;
  subtitle?: string;
}

export const StandardHeader: React.FC<StandardHeaderProps> = ({ title, subtitle }) => {
  return (
    <Container variant="navigation" as="header">
      <H1>{title}</H1>
      {subtitle && <H2>{subtitle}</H2>}
    </Container>
  );
}; 