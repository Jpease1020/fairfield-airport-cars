'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone } from 'lucide-react';
import Logo from '@/components/Logo';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { Container, Text } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

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
    <Container as="nav" variant="header" padding="md">
      <Stack direction="horizontal" justify="between" align="center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Logo size="sm" />
          <Text size="lg" weight="bold">
            {getCompanyName()}
          </Text>
        </Link>

        {/* Desktop Navigation */}
        <Stack direction="horizontal" spacing="md">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`navigation-link ${item.current ? 'navigation-link-active' : 'navigation-link-inactive'}`}
            >
              {item.name}
            </Link>
                    ))}
        </Stack>

        {/* Contact Button */}
        <Link href={`tel:${getPhoneNumber()}`} className="flex items-center space-x-1">
          <Phone size={16} />
          <Text size="sm">Call Now</Text>
        </Link>

                  {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Open menu"
        >
          {mobileMenuOpen ? (
            <X size={20} />
          ) : (
            <Menu size={20} />
          )}
        </Button>
      </Stack>
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
