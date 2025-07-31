'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from '../layout/containers/Container';
import { Button } from '../ui-components/Button';
import { Span } from '../ui-components/Text';
import { Stack } from '../layout/grid/Stack';
import { EditableText } from '../ui-components/EditableSystem';

export interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
}

export interface BaseNavigationProps {
  logo: React.ReactNode;
  navigationItems: NavigationItem[];
  actions?: React.ReactNode;
  mobileActions?: React.ReactNode;
  dataTestIdPrefix?: string;
  editableFieldPrefix?: string;
}

export const BaseNavigation: React.FC<BaseNavigationProps> = ({
  logo,
  navigationItems,
  actions,
  mobileActions,
  dataTestIdPrefix = 'nav',
  editableFieldPrefix = 'navigation'
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="horizontal" spacing="lg" align="center" justify="space-between">
        {/* Logo */}
        {logo}

        {/* Desktop Navigation */}
        <Stack direction="horizontal" spacing="md" align="center">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              data-testid={`${dataTestIdPrefix}-${item.name.toLowerCase()}`}
            >
              <Button 
                variant={item.current ? 'primary' : 'ghost'} 
                size="sm"
              >
                <EditableText field={`${editableFieldPrefix}.${item.name.toLowerCase()}`}>
                  {item.name}
                </EditableText>
              </Button>
            </Link>
          ))}
        </Stack>

        {/* Desktop Actions */}
        {actions && (
          <Stack direction="horizontal" spacing="sm" align="center">
            {actions}
          </Stack>
        )}

        {/* Mobile Menu Button */}
        <Button
          onClick={toggleMobileMenu}
          variant="ghost"
          size="sm"
        >
          <Span>☰</Span>
        </Button>
      </Stack>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <Container variant="elevated" padding="md">
          <Stack spacing="sm">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobileMenu}
                data-testid={`${dataTestIdPrefix}-mobile-${item.name.toLowerCase()}`}
              >
                <Button 
                  variant={item.current ? 'primary' : 'ghost'} 
                  size="sm"
                  fullWidth
                >
                  <EditableText field={`${editableFieldPrefix}.mobile.${item.name.toLowerCase()}`}>
                    {item.name}
                  </EditableText>
                </Button>
              </Link>
            ))}
            {mobileActions && (
              <Stack direction="horizontal" spacing="sm">
                {mobileActions}
              </Stack>
            )}
          </Stack>
        </Container>
      )}
    </Container>
  );
}; 