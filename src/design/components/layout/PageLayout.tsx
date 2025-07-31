'use client';

import React from 'react';
import { Navigation, NavigationLink } from './Navigation';
import { Footer, FooterSection } from './Footer';
import { Container } from '@/ui';

export interface PageLayoutProps {
  children: React.ReactNode;
  navigation?: {
    variant?: 'default' | 'minimal' | 'elevated';
    sticky?: boolean;
    transparent?: boolean;
    logo?: React.ReactNode;
    links?: NavigationLink[];
    actions?: React.ReactNode;
  } | false;
  footer?: {
    variant?: 'default' | 'minimal' | 'elevated';
    compact?: boolean;
    logo?: React.ReactNode;
    sections?: FooterSection[];
    socialLinks?: Array<{
      platform: string;
      href: string;
      icon: string;
    }>;
    copyright?: string;
  } | false;
  className?: string;
  id?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  navigation,
  footer,
  className,
  id,
  ...rest
}) => {
  // Default navigation links
  const defaultNavLinks: NavigationLink[] = [
    { label: 'Home', href: '/', active: true },
    { label: 'Book Now', href: '/book' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ];

  // Default footer sections
  const defaultFooterSections: FooterSection[] = [
    {
      title: 'Services',
      links: [
        { label: 'Airport Pickup', href: '/services/pickup' },
        { label: 'Airport Dropoff', href: '/services/dropoff' },
        { label: 'Corporate Travel', href: '/services/corporate' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Careers', href: '/careers' }
      ]
    }
  ];

  // Default social links
  const defaultSocialLinks = [
    { platform: 'Facebook', href: 'https://facebook.com', icon: '📘' },
    { platform: 'Twitter', href: 'https://twitter.com', icon: '🐦' },
    { platform: 'Instagram', href: 'https://instagram.com', icon: '📷' }
  ];

  return (
    <div className={className} id={id} {...rest}>
      {/* Navigation */}
      {navigation !== false && (
        <Navigation
          variant={navigation?.variant || 'default'}
          sticky={navigation?.sticky ?? true}
          transparent={navigation?.transparent ?? false}
          logo={navigation?.logo}
          links={navigation?.links || defaultNavLinks}
          actions={navigation?.actions}
        />
      )}

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      {footer !== false && (
        <Footer
          variant={footer?.variant || 'default'}
          compact={footer?.compact ?? false}
          logo={footer?.logo}
          sections={footer?.sections || defaultFooterSections}
          socialLinks={footer?.socialLinks || defaultSocialLinks}
          copyright={footer?.copyright || '© 2024 Fairfield Airport Cars. All rights reserved.'}
        />
      )}
    </div>
  );
}; 