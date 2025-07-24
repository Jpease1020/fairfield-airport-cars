import React from 'react';

interface StandardHeaderProps {
  title?: string;
  subtitle?: string;
}

export const StandardHeader: React.FC<StandardHeaderProps> = ({ title, subtitle }) => {
  if (!title && !subtitle) return null;

  return (
    <header className="standard-header">
      {title && <h1 className="standard-title">{title}</h1>}
      {subtitle && <h2 className="standard-subtitle">{subtitle}</h2>}
    </header>
  );
}; 