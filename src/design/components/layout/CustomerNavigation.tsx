'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container, Button, Span, Stack } from '@/ui';
import { EditableText } from '@/ui';

export const CustomerNavigation: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Home', href: '/', current: pathname === '/' },
    { name: 'Book a Ride', href: '/book', current: pathname === '/book' },
    { name: 'About', href: '/about', current: pathname === '/about' },
    { name: 'Help', href: '/help', current: pathname === '/help' },
    { name: 'Portal', href: '/portal', current: pathname === '/portal' },
  ];

  return (
    <Container maxWidth="xl">
      <Stack direction="horizontal" spacing="lg" align="center" justify="between">
        {/* Logo */}
        <Link href="/">
          <Container>
            <EditableText field="navigation.logo">Fairfield Airport Cars</EditableText>
          </Container>
        </Link>

        {/* Desktop Navigation */}
        <Stack direction="horizontal" spacing="md" align="center">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              data-testid={`nav-${item.name.toLowerCase()}`}
            >
              <Button 
                variant={item.current ? 'primary' : 'ghost'} 
                size="sm"
              >
                <EditableText field={`navigation.${item.name.toLowerCase()}`}>
                  {item.name}
                </EditableText>
              </Button>
            </Link>
          ))}
        </Stack>

        {/* CTA Buttons */}
        <Stack direction="horizontal" spacing="sm" align="center">
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
        </Stack>

        {/* Mobile Menu Button */}
        <Button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          variant="ghost"
          size="sm"
        >
          <Span>☰</Span>
        </Button>
      </Stack>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <Container variant="elevated" padding="md">
          <Stack spacing="sm">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`nav-mobile-${item.name.toLowerCase()}`}
              >
                <Button 
                  variant={item.current ? 'primary' : 'ghost'} 
                  size="sm"
                  fullWidth
                >
                  <EditableText field={`navigation.mobile.${item.name.toLowerCase()}`}>
                    {item.name}
                  </EditableText>
                </Button>
              </Link>
            ))}
            <Stack direction="horizontal" spacing="sm">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm">
                  <EditableText field="navigation.mobile.login">Login</EditableText>
                </Button>
              </Link>
              <Link href="/book" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm">
                  <EditableText field="navigation.mobile.bookNow">Book Now</EditableText>
                </Button>
              </Link>
            </Stack>
          </Stack>
        </Container>
      )}
    </Container>
  );
}; 