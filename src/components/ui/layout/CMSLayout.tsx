import React from 'react';
import { CMSConfiguration } from '@/types/cms';
import { generateCSSVariables } from '@/lib/design';
import { cn } from '@/lib/utils/utils';

interface CMSLayoutProps {
  cmsConfig: CMSConfiguration;
  pageType: keyof CMSConfiguration['pages'];
  children: React.ReactNode;
  variant?: 'standard' | 'marketing' | 'portal' | 'admin' | 'conversion' | 'content' | 'status';
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
        variant === 'conversion' && 'bg-bg-primary',
        variant === 'content' && 'bg-bg-primary',
        variant === 'status' && 'bg-bg-primary',
        className
      )}
      style={cssVars}
    >
      {/* Header will be added here */}
      <main className="">
        {children}
      </main>
      {/* Footer will be added here */}
    </div>
  );
};

CMSLayout.displayName = 'CMSLayout'; 