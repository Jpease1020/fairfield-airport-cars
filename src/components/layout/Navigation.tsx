'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone } from 'lucide-react';
import Logo from '@/components/Logo';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';

const Navigation = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getPhoneNumber, getCompanyName } = useBusinessSettings();

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      current: pathname === '/'
    },
    {
      name: 'Book',
      href: '/book',
      current: pathname === '/book'
    },
    {
      name: 'Help',
      href: '/help',
      current: pathname === '/help'
    },
    {
      name: 'About',
      href: '/about',
      current: pathname === '/about'
    }
  ];

  return (
    <nav className="navigation">
      <div className="navigation-container">
        <div className="navigation-content">
          {/* Logo */}
          <div className="navigation-brand">
            <Link href="/" className="navigation-logo">
              <Logo className="navigation-logo-icon" />
              <span className="navigation-logo-text">
                {getCompanyName()}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="navigation-menu">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'navigation-link',
                  item.current
                    ? 'navigation-link-active'
                    : 'navigation-link-inactive'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Contact Button */}
          <div className="navigation-actions">
            <a 
              href={`tel:${getPhoneNumber()}`}
              className="navigation-contact-button"
            >
              <Phone className="navigation-contact-icon" />
              <span className="navigation-contact-text">Call Now</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="navigation-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
          >
            {mobileMenuOpen ? (
              <X className="navigation-mobile-icon" />
            ) : (
              <Menu className="navigation-mobile-icon" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="navigation-mobile-menu">
          <div className="navigation-mobile-content">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'navigation-mobile-link',
                  item.current
                    ? 'navigation-mobile-link-active'
                    : 'navigation-mobile-link-inactive'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="navigation-mobile-actions">
              <a 
                href={`tel:${getPhoneNumber()}`}
                className="navigation-mobile-contact-button"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Phone className="navigation-mobile-contact-icon" />
                <span className="navigation-mobile-contact-text">Call Now</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export { Navigation };
