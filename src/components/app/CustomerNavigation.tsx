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
import { useCMSData } from '../../design/providers/CMSDataProvider';
const LogoImage = styled.img`
  max-width: 300px;
`;

interface CustomerNavigationProps {
  width?: string;
}

export const CustomerNavigation: React.FC<CustomerNavigationProps> = ({ width }) => {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.navigation || {};
  
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
    ...(!isLoggedIn ? [{ name: 'Login', href: '/auth/login', current: false }] : []),
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
      {isLoggedIn && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => auth.signOut()}
          data-testid="nav-logout-button" 
          id="nav-logout-button"
          cmsId="nav-logout-button"
          
          text={cmsData?.['navigation-logout'] || 'Logout'}
        />
      )}
      {pathname !== '/book' && (
        <Button 
          variant="primary" 
          size="lg" 
          href="/book"
          data-testid="nav-book-now-button" 
          id="nav-book-now-button"
          cmsId="nav-book-now-button"
          
          text={cmsData?.['navigation-bookNow'] || 'Book Now'}
        />
      )}
    </>
  );

  const mobileActions = (
    <>
      {isLoggedIn && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => auth.signOut()}
          data-testid="nav-mobile-logout-button" 
          id="nav-mobile-logout-button"
          cmsId="nav-mobile-logout-button"
          
          text={cmsData?.['navigation-mobile-logout'] || 'Logout'}
        />
      )}
      {pathname !== '/book' && (
        <Button 
          variant="primary" 
          size="sm" 
          href="/book"
          data-testid="nav-mobile-book-now-button" 
          id="nav-mobile-book-now-button"
          cmsId="nav-mobile-book-now-button"
          
          text={cmsData?.['navigation-mobile-bookNow'] || 'Book Now'}
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