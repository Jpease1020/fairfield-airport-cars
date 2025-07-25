'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    <nav className="standard-navigation admin-nav">
      <div className="nav-container">
        <div className="nav-brand">
          <Link href="/admin" className="nav-logo">
            Admin Panel
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

        <div className="nav-actions">
          <Link href="/" className="btn btn-outline btn-sm">
            View Site
          </Link>
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
        <div className="mobile-menu">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`mobile-menu-link ${item.current ? 'mobile-menu-link-active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="mobile-menu-actions">
            <Link 
              href="/" 
              className="btn btn-outline btn-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              View Site
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}; 