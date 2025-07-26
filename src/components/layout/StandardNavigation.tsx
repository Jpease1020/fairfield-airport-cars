'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
      <div className="">
        <div className="nav-brand">
          <Link href="/" className="nav-logo">
            Fairfield Airport Cars
          </Link>
        </div>

        <div className="nav-menu">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-link ${item.current ? 'nav-link-active' : ''}`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="nav-mobile-toggle">
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="nav-mobile-menu">
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
        </div>
      )}
    </nav>
  );
}; 