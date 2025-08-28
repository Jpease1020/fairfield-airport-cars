'use client';

import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { usePathname } from 'next/navigation';
import { Button } from '../../design/components/base-components/Button';
import { BaseNavigation, NavigationItem } from '../../design/page-sections/nav/BaseNavigation';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/utils/firebase';

// Helper function to get field value from CMS
function getCMSField(cmsData: any, fieldPath: string, defaultValue: string = ''): string {
  if (!cmsData) return defaultValue;
  
  const resolvePath = (obj: any, path: string[]): unknown => {
    let cur: any = obj;
    for (const seg of path) {
      if (cur && typeof cur === 'object' && seg in cur) {
        cur = cur[seg as keyof typeof cur];
      } else {
        return undefined;
      }
    }
    return cur;
  };

  const value = resolvePath(cmsData, fieldPath.split('.'));
  return typeof value === 'string' ? (value as string) : defaultValue;
}

const LogoImage = styled.img`
  max-width: 300px;
`;

interface CustomerNavigationProps {
  width?: string;
  cmsData?: any;
}

export const CustomerNavigation: React.FC<CustomerNavigationProps> = ({ width = '100%', cmsData }) => {
  const pathname = usePathname();
  const { isAdmin } = useAdminStatus();
  const { isLoggedIn } = useAuth();
  const navigationItems: NavigationItem[] = [
    ...(pathname !== '/' ? [{ name: 'Home', href: '/', current: false }] : []),
    ...(pathname !== '/book' ? [{ name: 'Book a Ride', href: '/book', current: false }] : []),
    ...(pathname !== '/about' ? [{ name: 'About', href: '/about', current: false }] : []),
    ...(pathname !== '/help' ? [{ name: 'Help', href: '/help', current: false }] : []),
    ...(isLoggedIn && pathname !== '/dashboard' ? [{ name: 'My Dashboard', href: '/dashboard', current: false }] : []),
    ...(isAdmin && !pathname.startsWith('/admin') ? [{ name: 'Admin', href: '/admin', current: false }] : []),
  ];

  const logo = (
    <Link href="/" data-testid="nav-logo-link" id="nav-logo-link">
      <LogoImage 
        src="/logos/NewLogoNoBackground.png" 
        alt="Fairfield Airport Cars"
        height="120"
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
          {getCMSField(cmsData, 'navigation-login', 'Login')}
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => auth.signOut()}
          data-testid="nav-logout-button" 
          id="nav-logout-button"
        >
          {getCMSField(cmsData, 'navigation-logout', 'Logout')}
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
          {getCMSField(cmsData, 'navigation-bookNow', 'Book Now')}
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
          {getCMSField(cmsData, 'navigation-mobile-login', 'Login')}
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => auth.signOut()}
          data-testid="nav-mobile-logout-button" 
          id="nav-mobile-logout-button"
        >
          {getCMSField(cmsData, 'navigation-mobile-logout', 'Logout')}
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
          {getCMSField(cmsData, 'navigation-mobile-bookNow', 'Book Now')}
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
      cmsData={cmsData}
    />
  );
}; 