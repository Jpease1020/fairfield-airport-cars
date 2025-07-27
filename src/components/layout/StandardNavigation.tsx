'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container, Button, Span } from '@/components/ui';

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
    <Container variant="navigation">
      <Container>
        <Container>
          <Link href="/">
            Fairfield Airport Cars
          </Link>
        </Container>

        <Container>
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              variant={item.current ? 'active' : 'default'}
            >
              {item.name}
            </Link>
          ))}
        </Container>

        <Container>
          <Button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <Span></Span>
            <Span></Span>
            <Span></Span>
          </Button>
        </Container>
      </Container>

      {mobileMenuOpen && (
        <Container>
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              variant={item.current ? 'mobile-active' : 'mobile'}
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