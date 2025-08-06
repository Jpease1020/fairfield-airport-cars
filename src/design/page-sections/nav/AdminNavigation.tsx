'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../../components/base-components/Button';
import { EditableText } from '../../components/base-components/text/EditableText';
import { BaseNavigation, NavigationItem } from './BaseNavigation';

export const AdminNavigation: React.FC = () => {
  const pathname = usePathname();

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
      <EditableText field="adminNavigation.title">Admin Panel</EditableText>
    </Link>
  );

  const actions = (
    <Link href="/" data-testid="admin-nav-view-site-link" id="admin-nav-view-site-link">
      <Button variant="outline" size="sm" data-testid="admin-nav-view-site-button" id="admin-nav-view-site-button">
        <EditableText field="adminNavigation.viewSiteButton">View Site</EditableText>
      </Button>
    </Link>
  );

  const mobileActions = (
    <Link href="/" data-testid="admin-nav-mobile-view-site-link" id="admin-nav-mobile-view-site-link">
      <Button variant="outline" size="sm" data-testid="admin-nav-mobile-view-site-button" id="admin-nav-mobile-view-site-button">
        <EditableText field="adminNavigation.mobile.viewSiteButton">View Site</EditableText>
      </Button>
    </Link>
  );

  return (
    <BaseNavigation
      logo={logo}
      navigationItems={navigationItems}
      actions={actions}
      mobileActions={mobileActions}
      dataTestIdPrefix="admin-nav"
      editableFieldPrefix="adminNavigation"
    />
  );
}; 