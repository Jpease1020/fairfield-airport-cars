'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone } from 'lucide-react';
import Logo from '@/components/Logo';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { Container, Text } from '@/components/ui';

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
      <Container className="navigation-container">
        <Container className="navigation-content">
          {/* Logo */}
          <Container className="navigation-brand">
            <Link href="/" className="navigation-logo">
              <Logo className="navigation-logo-icon" />
              <Text className="navigation-logo-text">
                {getCompanyName()}
              </Text>
            </Link>
          </Container>

          {/* Desktop Navigation */}
          <Container className="navigation-menu">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`navigation-link ${item.current ? 'navigation-link-active' : 'navigation-link-inactive'}`}
              >
                {item.name}
              </Link>
            ))}
          </Container>

          {/* Contact Button */}
          <Container className="navigation-actions">
            <a 
              href={`tel:${getPhoneNumber()}`}
              className="navigation-contact-button"
            >
              <Phone className="navigation-contact-icon" />
              <Text className="navigation-contact-text">Call Now</Text>
            </a>
          </Container>

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
        </Container>
      </Container>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <Container className="navigation-mobile-menu">
          <Container className="navigation-mobile-content">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`navigation-mobile-link ${item.current ? 'navigation-mobile-link-active' : 'navigation-mobile-link-inactive'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            <Container className="navigation-mobile-actions">
              <a 
                href={`tel:${getPhoneNumber()}`}
                className="navigation-mobile-contact-button"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Phone className="navigation-mobile-contact-icon" />
                <Text className="navigation-mobile-contact-text">Call Now</Text>
              </a>
            </Container>
          </Container>
        </Container>
      )}
    </nav>
  );
};

export default Navigation;
