import React from 'react';
import { StandardHeader } from './StandardHeader';
import { StandardFooter } from './StandardFooter';
import { StandardNavigation } from './StandardNavigation';

interface StandardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showNavigation?: boolean;
  className?: string;
}

export const StandardLayout: React.FC<StandardLayoutProps> = ({
  children,
  title,
  subtitle,
  showHeader = true,
  showFooter = true,
  showNavigation = true,
  className = ''
}) => {
  return (
    <div className={`standard-layout ${className}`}>
      {showNavigation && <StandardNavigation />}
      
      <main >
        {showHeader && (title || subtitle) && (
          <StandardHeader title={title} subtitle={subtitle} />
        )}
        
        <div >
          {children}
        </div>
      </main>
      
      {showFooter && <StandardFooter />}
    </div>
  );
}; 