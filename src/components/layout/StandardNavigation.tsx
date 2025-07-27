'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container, Button } from '@/components/ui';

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
    <nav >
      <Container >
        <Container >
          <Link href="/" >
            Fairfield Airport Cars
          </Link>
        </Container>

        <Container >
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-link ${item.current ? 'nav-link-active' : ''}`}
            >
              {item.name}
            </Link>
          ))}
        </Container>

        <Container >
          <Button
            
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <span ></span>
            <span ></span>
            <span ></span>
          </Button>
        </Container>
      </Container>

      {mobileMenuOpen && (
        <Container >
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-mobile-link ${item.current ? 'nav-mobile-link-active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </Container>
      )}
    </nav>
  );
}; 