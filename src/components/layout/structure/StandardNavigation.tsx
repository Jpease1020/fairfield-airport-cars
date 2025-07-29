'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Container, Stack, Button, Text, EditableText } from '@/components/ui';
import { Logo as LogoImage } from '@/components/icons';
import { spacing, breakpoints } from '@/lib/design-system/tokens';

interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
}

interface StandardNavigationProps {
  items?: NavigationItem[];
  logo?: React.ReactNode;
  brandName?: string;
  ctaButton?: {
    label: string;
    href: string;
    variant?: 'primary' | 'outline';
  };
}

// Styled components
const NavigationContainer = styled.nav`
  background-color: var(--background-primary, #ffffff);
  border-bottom: 1px solid var(--border-default, #d1d5db);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavigationContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.md} 0;
  max-width: var(--container-max-width, 1200px);
  margin: 0 auto;
  padding-left: ${spacing.xl};
  padding-right: ${spacing.xl};
`;

const BrandSection = styled.a`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  
  &:hover {
    text-decoration: none;
  }
`;

const Logo = styled.div`
  margin-right: ${spacing.lg};
  display: flex;
  align-items: center;
  
  img {
    max-width: 60px;
    max-height: 60px;
    width: auto;
    height: auto;
    object-fit: cover;
    object-position: center;
    transform: scale(1.5);
    transform-origin: center;
    clip-path: inset(10% 10% 10% 10%);
  }
`;

const BrandName = styled.div`
  font-weight: 600;
  font-size: 1.125rem;
  margin-left: ${spacing.sm};
`;

const DesktopNav = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xl};
  
  @media (max-width: ${breakpoints.md}) {
    display: none;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${spacing.lg};
`;

const NavLink = styled.a`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--text-primary, #111827);
  font-weight: 500;
  transition: color 0.2s ease-in-out;
  
  &:hover {
    color: var(--primary-color, #0B1F3A);
  }
`;

const IconSpacer = styled.span`
  margin-right: ${spacing.sm};
`;

const DesktopCTA = styled(Button)`
  @media (max-width: ${breakpoints.md}) {
    display: none;
  }
`;

const MobileNav = styled.div`
  display: none;
  align-items: center;
  gap: ${spacing.md};
  
  @media (max-width: ${breakpoints.md}) {
    display: flex;
  }
`;

const MobileMenuButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: ${spacing.sm};
  border-radius: var(--border-radius-md, 0.375rem);
  transition: background-color 0.2s ease-in-out;
  
  &:hover {
    background-color: var(--background-secondary, #f9fafb);
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--background-primary, #ffffff);
  border-bottom: 1px solid var(--border-default, #d1d5db);
  padding: ${spacing.md};
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const MobileNavLink = styled.a`
  display: flex;
  align-items: center;
  padding: ${spacing.md} 0;
  text-decoration: none;
  color: var(--text-primary, #111827);
  font-weight: 500;
  border-bottom: 1px solid var(--border-default, #d1d5db);
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    color: var(--primary-color, #0B1F3A);
  }
`;

const MobileCTA = styled(Button)`
  width: 100%;
  margin-top: ${spacing.md};
`;

export const StandardNavigation: React.FC<StandardNavigationProps> = ({
  items = [
    { label: 'Home', href: '/' },
    { label: 'Book', href: '/book' },
    { label: 'Help', href: '/help' },
    { label: 'About', href: '/about' }
  ],
  logo = <LogoImage size="sm" width={30} height={30} />,
  brandName = 'Fairfield Airport Cars',
  ctaButton = {
    label: 'Book Now',
    href: '/book',
    variant: 'primary'
  }
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <NavigationContainer>
      <NavigationContent>
        {/* Brand/Logo */}
        <BrandSection href="/">
          <Logo>
            {logo}
          </Logo>
          <BrandName>
            <EditableText field="navigation.brandName" defaultValue={brandName}>
              {brandName}
            </EditableText>
          </BrandName>
        </BrandSection>

        {/* Desktop Navigation */}
        <DesktopNav>
          <NavLinks>
            {items.map((item, index) => (
              <NavLink 
                key={index} 
                href={item.href}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.icon && <IconSpacer>{item.icon}</IconSpacer>}
                <EditableText field={`navigation.items.${index}.label`} defaultValue={item.label}>
                  {item.label}
                </EditableText>
              </NavLink>
            ))}
          </NavLinks>
          
          {/* Desktop CTA Button */}
          {ctaButton && (
            <DesktopCTA 
              variant={ctaButton.variant || 'primary'} 
              size="sm"
              onClick={() => window.location.href = ctaButton.href}
            >
              <EditableText field="navigation.ctaButton.label" defaultValue={ctaButton.label}>
                {ctaButton.label}
              </EditableText>
            </DesktopCTA>
          )}
        </DesktopNav>

        {/* Mobile Navigation */}
        <MobileNav>
          {/* Mobile CTA Button (visible on mobile) */}
          {ctaButton && (
            <Button 
              variant={ctaButton.variant || 'primary'} 
              size="sm"
              onClick={() => window.location.href = ctaButton.href}
            >
              <EditableText field="navigation.ctaButton.label" defaultValue={ctaButton.label}>
                {ctaButton.label}
              </EditableText>
            </Button>
          )}
          
          {/* Mobile Menu Button */}
          <MobileMenuButton
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            ☰
          </MobileMenuButton>
        </MobileNav>
      </NavigationContent>

      {/* Mobile Navigation Menu */}
      <MobileMenu $isOpen={isMobileMenuOpen}>
        {items.map((item, index) => (
          <MobileNavLink 
            key={index} 
            href={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            data-testid={`nav-mobile-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {item.icon && <IconSpacer>{item.icon}</IconSpacer>}
            <EditableText field={`navigation.items.${index}.label`} defaultValue={item.label}>
              {item.label}
            </EditableText>
          </MobileNavLink>
        ))}
        
        {/* Mobile CTA Button (in menu) */}
        {ctaButton && (
          <MobileCTA 
            variant={ctaButton.variant || 'primary'} 
            size="md"
            onClick={() => {
              window.location.href = ctaButton.href;
              setIsMobileMenuOpen(false);
            }}
          >
            <EditableText field="navigation.ctaButton.label" defaultValue={ctaButton.label}>
              {ctaButton.label}
            </EditableText>
          </MobileCTA>
        )}
      </MobileMenu>
    </NavigationContainer>
  );
}; 