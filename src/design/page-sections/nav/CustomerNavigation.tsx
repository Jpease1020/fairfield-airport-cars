'use client';

import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { usePathname } from 'next/navigation';
import { Button, EditableText } from '@/ui';
import { BaseNavigation, NavigationItem } from './BaseNavigation';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/utils/firebase';

const LogoImage = styled.img`
  max-width: 300px;
`;

export const CustomerNavigation: React.FC<{ width?: string }> = ({ width = '100%' }) => {
  const pathname = usePathname();
  const { isAdmin } = useAdminStatus();
  const { isLoggedIn } = useAuth();

  const navigationItems: NavigationItem[] = [
    ...(pathname !== '/' ? [{ name: 'Home', href: '/', current: false }] : []),
    ...(pathname !== '/book' ? [{ name: 'Book a Ride', href: '/book', current: false }] : []),
    ...(pathname !== '/about' ? [{ name: 'About', href: '/about', current: false }] : []),
    ...(pathname !== '/help' ? [{ name: 'Help', href: '/help', current: false }] : []),
    ...(pathname !== '/portal' ? [{ name: 'Portal', href: '/portal', current: false }] : []),
    ...(isAdmin && !pathname.startsWith('/admin') ? [{ name: 'Admin', href: '/admin', current: false }] : []),
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
      {!isLoggedIn ? (
        <Button 
          variant="outline" 
          size="sm" 
          href="/login"
          data-testid="nav-login-button" 
          id="nav-login-button"
        >
          <EditableText field="navigation.login">Login</EditableText>
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => auth.signOut()}
          data-testid="nav-logout-button" 
          id="nav-logout-button"
        >
          <EditableText field="navigation.logout">Logout</EditableText>
        </Button>
      )}
      {pathname !== '/book' && (
        <Button 
          variant="primary" 
          size="sm" 
          href="/book"
          data-testid="nav-book-now-button" 
          id="nav-book-now-button"
        >
          <EditableText field="navigation.bookNow">Book Now</EditableText>
        </Button>
      )}
    </>
  );

  const mobileActions = (
    <>
      {!isLoggedIn ? (
        <Button 
          variant="outline" 
          size="sm" 
          href="/login"
          data-testid="nav-mobile-login-button" 
          id="nav-mobile-login-button"
        >
          <EditableText field="navigation.mobile.login">Login</EditableText>
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => auth.signOut()}
          data-testid="nav-mobile-logout-button" 
          id="nav-mobile-logout-button"
        >
          <EditableText field="navigation.mobile.logout">Logout</EditableText>
        </Button>
      )}
      {pathname !== '/book' && (
        <Button 
          variant="primary" 
          size="sm" 
          href="/book"
          data-testid="nav-mobile-book-now-button" 
          id="nav-mobile-book-now-button"
        >
          <EditableText field="navigation.mobile.bookNow">Book Now</EditableText>
        </Button>
      )}
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
      width={width}
    />
  );
}; 