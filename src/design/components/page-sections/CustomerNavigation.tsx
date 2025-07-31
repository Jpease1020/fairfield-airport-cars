'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container, Button, EditableText } from '@/design/ui';
import { BaseNavigation, NavigationItem } from './BaseNavigation';

export const CustomerNavigation: React.FC = () => {
  const pathname = usePathname();

  const navigationItems: NavigationItem[] = [
    { name: 'Home', href: '/', current: pathname === '/' },
    { name: 'Book a Ride', href: '/book', current: pathname === '/book' },
    { name: 'About', href: '/about', current: pathname === '/about' },
    { name: 'Help', href: '/help', current: pathname === '/help' },
    { name: 'Portal', href: '/portal', current: pathname === '/portal' },
  ];

  const logo = (
    <Link href="/">
      <Container>
        <EditableText field="navigation.logo">Fairfield Airport Cars</EditableText>
      </Container>
    </Link>
  );

  const actions = (
    <>
      <Link href="/login">
        <Button variant="outline" size="sm">
          <EditableText field="navigation.login">Login</EditableText>
        </Button>
      </Link>
      <Link href="/book">
        <Button variant="primary" size="sm">
          <EditableText field="navigation.bookNow">Book Now</EditableText>
        </Button>
      </Link>
    </>
  );

  const mobileActions = (
    <>
      <Link href="/login">
        <Button variant="outline" size="sm">
          <EditableText field="navigation.mobile.login">Login</EditableText>
        </Button>
      </Link>
      <Link href="/book">
        <Button variant="primary" size="sm">
          <EditableText field="navigation.mobile.bookNow">Book Now</EditableText>
        </Button>
      </Link>
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
    />
  );
}; 