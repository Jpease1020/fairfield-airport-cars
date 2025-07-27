'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container, Button, Span } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

export const StandardNavigation: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Home', href: '/', current: pathname === '/' },
    { name: 'Book', href: '/book', current: pathname === '/book' },
    { name: 'Help', href: '/help', current: pathname === '/help' },
    { name: 'About', href: '/about', current: pathname === '/about' },
  ];

  return (
    <Container variant="navigation" padding="md">
      <Stack direction="horizontal" justify="between" align="center">
        <Link href="/">
          Fairfield Airport Cars
        </Link>

        <Stack direction="horizontal" spacing="md">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
            >
              {item.name}
            </Link>
          ))}
        </Stack>

        <Button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          variant="ghost"
        >
          <Span>☰</Span>
        </Button>
      </Stack>

      {mobileMenuOpen && (
        <Container>
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </Container>
      )}
    </Container>
  );
}; 