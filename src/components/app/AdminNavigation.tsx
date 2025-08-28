'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../../design/components/base-components/Button';
import { BaseNavigation, NavigationItem } from '../../design/page-sections/nav/BaseNavigation';
import { auth } from '../../lib/utils/firebase';

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

interface AdminNavigationProps {
  cmsData: any;
}

export const AdminNavigation: React.FC<AdminNavigationProps> = ({ cmsData }) => {
  const pathname = usePathname();
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
    { name: 'Comments', href: '/admin/comments', current: pathname === '/admin/comments' },
    { name: 'CMS', href: '/admin/cms', current: pathname.startsWith('/admin/cms') },
    { name: 'Costs', href: '/admin/costs', current: pathname === '/admin/costs' },
  ];

  const logo = (
    <Link href="/admin" data-testid="admin-nav-logo-link" id="admin-nav-logo-link">
      {getCMSField(cmsData, 'adminNavigation-title', 'Admin Panel')}
    </Link>
  );

  const actions = (
    <Link href="/" data-testid="admin-nav-view-site-link" id="admin-nav-view-site-link">
      <Button variant="outline" size="sm" data-testid="admin-nav-view-site-button" id="admin-nav-view-site-button">
        {getCMSField(cmsData, 'adminNavigation-viewSiteButton', 'View Site')}
      </Button>
    </Link>
  );

  const mobileActions = (
    <Link href="/" data-testid="admin-nav-mobile-view-site-link" id="admin-nav-mobile-view-site-link">
      <Button variant="outline" size="sm" data-testid="admin-nav-mobile-view-site-button" id="admin-nav-mobile-view-site-button">
        {getCMSField(cmsData, 'adminNavigation-mobile-viewSiteButton', 'View Site')}
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
      cmsData={cmsData}
    />
  );
}; 
