import React from 'react';
import { CMSConfiguration } from '@/types/cms';
import { generateCSSVariables } from '@/lib/design';
import { cn } from '@/lib/utils/utils';

interface CMSLayoutProps {
  cmsConfig: CMSConfiguration;
  pageType: keyof CMSConfiguration['pages'];
  children: React.ReactNode;
  variant?: 'standard' | 'marketing' | 'portal' | 'admin';
  className?: string;
}

export const CMSLayout: React.FC<CMSLayoutProps> = ({
  cmsConfig,
  pageType,
  children,
  variant = 'standard',
  className
}) => {
  const cssVars = generateCSSVariables(cmsConfig);
  
  return (
    <div 
      className={cn(
        'min-h-screen flex flex-col',
        variant === 'marketing' && 'bg-bg-primary',
        variant === 'portal' && 'bg-bg-secondary',
        variant === 'admin' && 'bg-bg-muted',
        className
      )}
      style={cssVars}
    >
      {/* Header will be added here */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      {/* Footer will be added here */}
    </div>
  );
};

CMSLayout.displayName = 'CMSLayout'; 