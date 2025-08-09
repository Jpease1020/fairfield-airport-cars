'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../../design/components/base-components/Button';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';
import { BaseNavigation, NavigationItem } from '../../design/page-sections/nav/BaseNavigation';
import { auth } from '../../lib/utils/firebase';

export const AdminNavigation: React.FC = () => {
  const pathname = usePathname();
  const { cmsData } = useCMSData();
  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', href: '/admin', current: pathname === '/admin' },
    { name: 'Bookings', href: '/admin/bookings', current: pathname === '/admin/bookings' },
    { name: 'Calendar', href: '/admin/calendar', current: pathname === '/admin/calendar' },
    { name: 'Drivers', href: '/admin/drivers', current: pathname === '/admin/drivers' },
    { name: 'CMS', href: '/admin/cms', current: pathname.startsWith('/admin/cms') },
    { name: 'Costs', href: '/admin/costs', current: pathname === '/admin/costs' },
  ];

  const logo = (
    <Link href="/admin" data-testid="admin-nav-logo-link" id="admin-nav-logo-link">
      {getCMSField(cmsData, 'adminNavigation.title', 'Admin Panel')}
    </Link>
  );

  const actions = (
    <Link href="/" data-testid="admin-nav-view-site-link" id="admin-nav-view-site-link">
      <Button variant="outline" size="sm" data-testid="admin-nav-view-site-button" id="admin-nav-view-site-button">
        {getCMSField(cmsData, 'adminNavigation.viewSiteButton', 'View Site')}
      </Button>
    </Link>
  );

  const mobileActions = (
    <Link href="/" data-testid="admin-nav-mobile-view-site-link" id="admin-nav-mobile-view-site-link">
      <Button variant="outline" size="sm" data-testid="admin-nav-mobile-view-site-button" id="admin-nav-mobile-view-site-button">
        {getCMSField(cmsData, 'adminNavigation.mobile.viewSiteButton', 'View Site')}
      </Button>
    </Link>
  );

  const logoutButton = (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
    >
      🚪 Logout
    </Button>
  );


  return (
    <BaseNavigation
      logo={logo}
      navigationItems={navigationItems}
      actions={[actions, logoutButton] as React.ReactNode[]}
      mobileActions={mobileActions}
      dataTestIdPrefix="admin-nav"
      editableFieldPrefix="adminNavigation"
    />
  );
}; 
