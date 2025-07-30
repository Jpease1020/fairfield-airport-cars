'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone } from 'lucide-react';
import { Logo } from '@/components/icons';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { Container, Text } from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';
import { EditableText } from '@/components/ui';

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
    <Container as="nav" variant="navigation" padding="md">
      <Stack direction="horizontal" justify="between" align="center">
        {/* Logo */}
        <Link href="/" data-testid="nav-home">
          <Stack direction="horizontal" spacing="sm" align="center">
            <Logo size="sm" />
            <EditableText field="navigation.company_name" defaultValue={getCompanyName()}>
              {getCompanyName()}
            </EditableText>
          </Stack>
        </Link>

        {/* Desktop Navigation */}
        <Stack direction="horizontal" spacing="md">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              data-testid={`nav-${item.name.toLowerCase()}`}
            >
              {item.name}
            </Link>
          ))}
        </Stack>

        {/* Contact Button */}
        <Link href={`tel:${getPhoneNumber()}`} data-testid="nav-call-now">
          <Stack direction="horizontal" spacing="sm" align="center">
            <Phone size={16} />
            <EditableText field="navigation.call_now" defaultValue="Call Now">
              Call Now
            </EditableText>
          </Stack>
        </Link>

                  {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Open menu"
          data-testid="mobile-menu-toggle"
        >
          {mobileMenuOpen ? (
            <X size={20} />
          ) : (
            <Menu size={20} />
          )}
        </Button>
      </Stack>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <Container padding="md" data-testid="mobile-menu">
          <Stack direction="vertical" spacing="md">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`nav-mobile-${item.name.toLowerCase()}`}
              >
                {item.name}
              </Link>
            ))}
            
            <Link 
              href={`tel:${getPhoneNumber()}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Stack direction="horizontal" spacing="sm" align="center">
                <Phone size={16} />
                <EditableText field="navigation.call_now" defaultValue="Call Now">
                  Call Now
                </EditableText>
              </Stack>
            </Link>
          </Stack>
        </Container>
      )}
    </Container>
  );
};

export default Navigation;
