'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../../design/components/base-components/Button';
import { BaseNavigation, NavigationItem } from '../../design/page-sections/nav/BaseNavigation';
import { auth } from '../../lib/utils/firebase';
import { useCMSData } from '../../design/providers/CMSDataProvider';

export const AdminNavigation: React.FC = () => {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.admin || {};
  
  const pathname = usePathname();
  const currentPath = pathname ?? '';
  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', href: '/admin', current: currentPath === '/admin' },
    { name: 'Bookings', href: '/admin/bookings', current: currentPath === '/admin/bookings' },
    { name: 'Payments', href: '/admin/payments', current: currentPath === '/admin/payments' },
    { name: 'Messages', href: '/admin/messages', current: currentPath === '/admin/messages' },
    { name: 'Schedule', href: '/admin/schedules', current: currentPath.startsWith('/admin/schedules') },
    { name: 'Settings', href: '/admin/settings', current: currentPath === '/admin/settings' },
  ];

  const logo = (
    <Link href="/admin" data-testid="admin-nav-logo-link" id="admin-nav-logo-link">
      {cmsData?.['adminNavigation-title'] || 'Admin Panel'}
    </Link> 
  );

  const actions = (
    <Link href="/" data-testid="admin-nav-view-site-link" id="admin-nav-view-site-link">
      <Button variant="outline" size="sm" data-testid="admin-nav-view-site-button" id="admin-nav-view-site-button" cmsId="admin-nav-view-site-button"  text={cmsData?.['adminNavigation-viewSiteButton'] || 'View Site'} />
    </Link>
  );

  const mobileActions = (
    <Link href="/" data-testid="admin-nav-mobile-view-site-link" id="admin-nav-mobile-view-site-link">
      <Button variant="outline" size="sm" data-testid="admin-nav-mobile-view-site-button" id="admin-nav-mobile-view-site-button" cmsId="admin-nav-mobile-view-site-button"  text={cmsData?.['adminNavigation-mobile-viewSiteButton'] || 'View Site'} />
    </Link>
  );

  const logoutButton = (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      cmsId="admin-logout-button"
      
      text="🚪 Logout"
    />
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
