'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui-components/Button';
import { EditableText } from '../ui-components/EditableSystem';
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
    <Link href="/admin">
      <EditableText field="adminNavigation.title">Admin Panel</EditableText>
    </Link>
  );

  const actions = (
    <Link href="/">
      <Button variant="outline" size="sm">
        <EditableText field="adminNavigation.viewSiteButton">View Site</EditableText>
      </Button>
    </Link>
  );

  const mobileActions = (
    <Link href="/">
      <Button variant="outline" size="sm">
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