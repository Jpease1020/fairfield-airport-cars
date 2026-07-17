'use client';

import React from 'react';
import styled from 'styled-components';
import { usePathname } from 'next/navigation';
import { Button } from '../../design/components/base-components/Button';
import { BaseNavigation, NavigationItem } from '../../design/page-sections/nav/BaseNavigation';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/utils/firebase';
import { useCMSData } from '../../design/providers/CMSDataProvider';
const LogoImage = styled.img`
  max-width: 300px;
`;

const MobileBookNowButton = styled(Button)`
  margin-top: 8px;
`;

interface CustomerNavigationProps {
  width?: string;
}

export const CustomerNavigation: React.FC<CustomerNavigationProps> = ({ width }) => {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.navigation || {};
  
  const pathname = usePathname();
  const currentPath = pathname ?? '';

  const handleLogout = async () => {
    // auth.signOut() only clears Firebase client auth state — the app's own booking_session
    // cookie (set by the OTP/magic-link flow) is separate and must be cleared server-side too,
    // or the session stays valid for up to 30 days despite the user believing they logged out.
    try {
      await Promise.all([
        auth.signOut(),
        fetch('/api/auth/logout', { method: 'POST' }),
      ]);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  const { isAdmin } = useAdminStatus();
  const { isLoggedIn } = useAuth();
  const navigationItems: NavigationItem[] = [
    ...(currentPath !== '/' ? [{ name: 'Home', href: '/', current: false }] : []),
    // "Book Now" button in actions handles booking CTA — no need for duplicate nav link
    ...(currentPath !== '/about' ? [{ name: 'About', href: '/about', current: false }] : []),
    ...(currentPath !== '/help' ? [{ name: 'Help', href: '/help', current: false }] : []),
    ...(isLoggedIn && currentPath !== '/dashboard' ? [{ name: 'My Dashboard', href: '/dashboard', current: false }] : []),
    ...(isAdmin && !currentPath.startsWith('/admin') ? [{ name: 'Admin', href: '/admin', current: false }] : []),
    ...(!isLoggedIn ? [{ name: 'Login', href: '/auth/login', current: false }] : []),
    // Logout is in the actions area as a ghost button, not a nav link
  ];

  const logo = (
    <LogoImage 
      src="/logos/NewLogoNoBackground.png" 
      alt="Fairfield Airport Cars"
      height="120"
      width="auto"
      data-testid="nav-logo"
      id="nav-logo"
    />
  );

  const actions = (
    <>
      {currentPath !== '/book' && (
        <Button
          variant="primary"
          size="lg"
          href="/book"
          data-testid="nav-book-now-button"
          id="nav-book-now-button"


          text={cmsData?.['navigation-bookNow'] || 'Book Now'}
        />
      )}
      {isLoggedIn && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          data-testid="nav-logout-button"
          id="nav-logout-button"
          text={cmsData?.['navigation-logout'] || 'Sign Out'}
        />
      )}
    </>
  );

  const mobileActions = (
    <>
      {currentPath !== '/book' && (
        <MobileBookNowButton
          variant="primary"
          size="sm"
          href="/book"
          data-testid="nav-mobile-book-now-button"
          id="nav-mobile-book-now-button"
          text={cmsData?.['navigation-mobile-bookNow'] || 'Book Now'}
        />
      )}
      {isLoggedIn && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          data-testid="nav-mobile-logout-button"
          id="nav-mobile-logout-button"
          text={cmsData?.['navigation-mobile-logout'] || 'Sign Out'}
        />
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