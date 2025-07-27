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
    <nav className="standard-navigation">
      <Container className="">
        <Container className="nav-brand">
          <Link href="/" className="nav-logo">
            Fairfield Airport Cars
          </Link>
        </Container>

        <Container className="nav-menu">
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

        <Container className="nav-mobile-toggle">
          <Button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </Button>
        </Container>
      </Container>

      {mobileMenuOpen && (
        <Container className="nav-mobile-menu">
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