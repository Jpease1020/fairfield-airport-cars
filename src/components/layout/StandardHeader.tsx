import React from 'react';
import { H1, H2 } from '@/components/ui';

interface StandardHeaderProps {
  title?: string;
  subtitle?: string;
}

export const StandardHeader: React.FC<StandardHeaderProps> = ({ title, subtitle }) => {
  if (!title && !subtitle) return null;

  return (
    <header className="standard-header">
      {title && <H1 className="standard-title">{title}</H1>}
      {subtitle && <H2 className="standard-subtitle">{subtitle}</H2>}
    </header>
  );
}; 