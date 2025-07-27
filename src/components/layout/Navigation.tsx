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
    <nav >
      <Container >
        <Container >
          {/* Logo */}
          <Container >
            <Link href="/" >
              <Logo  />
              <Text >
                {getCompanyName()}
              </Text>
            </Link>
          </Container>

          {/* Desktop Navigation */}
          <Container >
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
          <Container >
            <a 
              href={`tel:${getPhoneNumber()}`}
              
            >
              <Phone  />
              <Text >Call Now</Text>
            </a>
          </Container>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
          >
            {mobileMenuOpen ? (
              <X  />
            ) : (
              <Menu  />
            )}
          </Button>
        </Container>
      </Container>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <Container >
          <Container >
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
            
            <Container >
              <a 
                href={`tel:${getPhoneNumber()}`}
                
                onClick={() => setMobileMenuOpen(false)}
              >
                <Phone  />
                <Text >Call Now</Text>
              </a>
            </Container>
          </Container>
        </Container>
      )}
    </nav>
  );
};

export default Navigation;
