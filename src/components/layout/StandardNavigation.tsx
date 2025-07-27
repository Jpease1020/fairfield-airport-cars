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
    <Container variant="navigation" padding="md">
      <div className="flex justify-between items-center">
        <Link href="/">
          Fairfield Airport Cars
        </Link>

        <nav className="flex space-x-6">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              variant={item.current ? 'active' : 'default'}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <Button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          variant="ghost"
        >
          <Span></Span>
          <Span></Span>
          <Span></Span>
        </Button>
      </div>

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