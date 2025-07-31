'use client';

import React from 'react';
import { Navigation } from '../layout/Navigation';
import { Footer } from '../layout/Footer';
import { Container } from '../layout/containers/Container';

export interface StandardPageProps {
  children: React.ReactNode;
  navigation?: {
    variant?: 'default' | 'minimal' | 'elevated';
    sticky?: boolean;
    transparent?: boolean;
    logo?: React.ReactNode;
    links?: Array<{
      label: string;
      href: string;
      active?: boolean;
    }>;
    actions?: React.ReactNode;
  } | false;
  footer?: {
    variant?: 'default' | 'minimal' | 'elevated';
    compact?: boolean;
    logo?: React.ReactNode;
    sections?: Array<{
      title: string;
      links: Array<{
        label: string;
        href: string;
      }>;
    }>;
    socialLinks?: Array<{
      platform: string;
      href: string;
      icon: string;
    }>;
    copyright?: string;
  } | false;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  id?: string;
}

export const StandardPage: React.FC<StandardPageProps> = ({
  children,
  navigation,
  footer,
  maxWidth = '2xl',
  padding = 'lg',
  className,
  id,
  ...rest
}) => {
  return (
    <div className={className} id={id} {...rest}>
      {navigation && <Navigation {...navigation} />}
      <Container maxWidth={maxWidth} padding={padding}>
        {children}
      </Container>
      {footer && <Footer {...footer} />}
    </div>
  );
}; 