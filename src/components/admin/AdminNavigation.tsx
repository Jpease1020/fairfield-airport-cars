'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container, Button, Span, EditableText } from '@/components/ui';

export const AdminNavigation: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', href: '/admin', current: pathname === '/admin' },
    { name: 'Bookings', href: '/admin/bookings', current: pathname === '/admin/bookings' },
    { name: 'Calendar', href: '/admin/calendar', current: pathname === '/admin/calendar' },
    { name: 'Drivers', href: '/admin/drivers', current: pathname === '/admin/drivers' },
    { name: 'CMS', href: '/admin/cms', current: pathname.startsWith('/admin/cms') },
    { name: 'Costs', href: '/admin/costs', current: pathname === '/admin/costs' },
  ];

  return (
    <Container maxWidth="xl">
      <Link href="/admin">
        <EditableText field="adminNavigation.title">Admin Panel</EditableText>
      </Link>

      {navigationItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
        >
          <EditableText field={`adminNavigation.${item.name.toLowerCase()}`}>
            {item.name}
          </EditableText>
        </Link>
      ))}

      <Link href="/">
        <Button variant="outline" size="sm">
          <EditableText field="adminNavigation.viewSiteButton">View Site</EditableText>
        </Button>
      </Link>

      <Button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        variant="ghost"
        size="sm"
      >
        <Span>☰</Span>
      </Button>

      {mobileMenuOpen && (
        <>
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
            >
              <EditableText field={`adminNavigation.mobile.${item.name.toLowerCase()}`}>
                {item.name}
              </EditableText>
            </Link>
          ))}
          <Link 
            href="/" 
            onClick={() => setMobileMenuOpen(false)}
          >
            <Button variant="outline" size="sm">
              <EditableText field="adminNavigation.mobile.viewSiteButton">View Site</EditableText>
            </Button>
          </Link>
        </>
      )}
    </Container>
  );
}; 