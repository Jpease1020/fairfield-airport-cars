import React from 'react';
import { Section } from '@/components/ui/layout/containers';

// PageSection Component - BULLETPROOF TYPE SAFETY!
interface PageSectionProps {
  children: React.ReactNode;
  variant?: 'default' | 'alternate' | 'brand' | 'muted' | 'hero' | 'cta';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  background?: 'default' | 'elevated' | 'muted';
  theme?: 'light' | 'dark';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const PageSection: React.FC<PageSectionProps> = ({
  children,
  variant = 'default',
  spacing = 'lg'
}) => {
  return (
    <Section 
      variant={variant}
      padding={spacing}
    >
      {children}
    </Section>
  );
}; 