import React from 'react';
import { H1, H2 } from '@/components/ui';

interface StandardHeaderProps {
  title?: string;
  subtitle?: string;
}

export const StandardHeader: React.FC<StandardHeaderProps> = ({ title, subtitle }) => {
  if (!title && !subtitle) return null;

  return (
    <header >
      {title && <H1 >{title}</H1>}
      {subtitle && <H2 >{subtitle}</H2>}
    </header>
  );
}; 