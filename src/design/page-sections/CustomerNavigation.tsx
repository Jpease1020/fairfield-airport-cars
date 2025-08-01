'use client';

import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { usePathname } from 'next/navigation';
import { Button, EditableText } from '@/design/ui';
import { BaseNavigation, NavigationItem } from './BaseNavigation';

const LogoImage = styled.img`
  max-width: 300px;
`;

export const CustomerNavigation: React.FC = () => {
  const pathname = usePathname();

  const navigationItems: NavigationItem[] = [
    { name: 'Home', href: '/', current: pathname === '/' },
    { name: 'Book a Ride', href: '/book', current: pathname === '/book' },
    { name: 'About', href: '/about', current: pathname === '/about' },
    { name: 'Help', href: '/help', current: pathname === '/help' },
    { name: 'Portal', href: '/portal', current: pathname === '/portal' },
  ];

  const logo = (
    <Link href="/" data-testid="nav-logo-link" id="nav-logo-link">
      <LogoImage 
        src="/logos/NewLogoNoBackground.png" 
        alt="Fairfield Airport Cars"
        height="60"
        width="auto"
      />
    </Link>
  );

  const actions = (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        href="/login"
        data-testid="nav-login-button" 
        id="nav-login-button"
      >
        <EditableText field="navigation.login">Login</EditableText>
      </Button>
      <Button 
        variant="primary" 
        size="sm" 
        href="/book"
        data-testid="nav-book-now-button" 
        id="nav-book-now-button"
      >
        <EditableText field="navigation.bookNow">Book Now</EditableText>
      </Button>
    </>
  );

  const mobileActions = (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        href="/login"
        data-testid="nav-mobile-login-button" 
        id="nav-mobile-login-button"
      >
        <EditableText field="navigation.mobile.login">Login</EditableText>
      </Button>
      <Button 
        variant="primary" 
        size="sm" 
        href="/book"
        data-testid="nav-mobile-book-now-button" 
        id="nav-mobile-book-now-button"
      >
        <EditableText field="navigation.mobile.bookNow">Book Now</EditableText>
      </Button>
    </>
  );

  return (
    <BaseNavigation
      logo={logo}
      navigationItems={navigationItems}
      actions={actions}
      mobileActions={mobileActions}
      dataTestIdPrefix="nav"
      editableFieldPrefix="navigation"
    />
  );
}; 