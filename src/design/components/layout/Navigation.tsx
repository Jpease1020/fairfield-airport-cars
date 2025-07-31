'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, transitions } from '../../system/tokens/tokens';
import { Text, H1, H2, H3, H4, H5, H6, Paragraph, Span, Link } from '@/ui';
import { Button } from '@/ui';
import { Row, Col, Stack, Container } from '../grid';

// Styled navigation component
const StyledNavigation = styled.nav.withConfig({
  shouldForwardProp: (prop) => !['variant', 'sticky', 'transparent'].includes(prop)
})<{
  variant: 'default' | 'minimal' | 'elevated';
  sticky: boolean;
  transparent: boolean;
}>`
  width: 100%;
  transition: all 0.3s ease-in-out;
  z-index: 1000;

  ${({ sticky }) => sticky && `
    position: sticky;
    top: 0;
  `}

  ${({ transparent }) => transparent && `
    background: transparent;
  `}

  ${({ variant }) => {
    switch (variant) {
      case 'default':
        return `
          background-color: ${colors.background.primary};
          border-bottom: 1px solid ${colors.border.default};
          padding: ${spacing.md} 0;
        `;
      case 'minimal':
        return `
          background-color: transparent;
          padding: ${spacing.sm} 0;
        `;
      case 'elevated':
        return `
          background-color: ${colors.background.primary};
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: ${spacing.md} 0;
        `;
      default:
        return `
          background-color: ${colors.background.primary};
          border-bottom: 1px solid ${colors.border.default};
          padding: ${spacing.md} 0;
        `;
    }
  }}
`;

const NavigationLink = styled.a.withConfig({
  shouldForwardProp: (prop) => !['active', 'variant'].includes(prop)
})<{
  active: boolean;
  variant: 'default' | 'minimal' | 'elevated';
}>`
  text-decoration: none;
  font-weight: 500;
  transition: ${transitions.default};
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.md};

  ${({ variant }) => {
    switch (variant) {
      case 'default':
        return `
          color: ${colors.text.primary};
          &:hover {
            color: ${colors.primary[600]};
            background-color: ${colors.primary[50]};
          }
        `;
      case 'minimal':
        return `
          color: ${colors.text.secondary};
          &:hover {
            color: ${colors.text.primary};
          }
        `;
      default:
        return `
          color: ${colors.text.primary};
          &:hover {
            color: ${colors.primary[600]};
            background-color: ${colors.primary[50]};
          }
        `;
    }
  }}

  ${({ active }) => active && `
    color: ${colors.primary[600]};
    background-color: ${colors.primary[50]};
  `}
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  padding: ${spacing.sm};
  cursor: pointer;
  color: ${colors.text.primary};

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.div<{ isOpen: boolean }>`
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: ${colors.background.primary};
  border-top: 1px solid ${colors.border.default};
  padding: ${spacing.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  }
`;

export interface NavigationLink {
  label: string;
  href: string;
  active?: boolean;
}

export interface NavigationProps {
  variant?: 'default' | 'minimal' | 'elevated';
  sticky?: boolean;
  transparent?: boolean;
  logo?: React.ReactNode;
  links?: NavigationLink[];
  actions?: React.ReactNode;
  onLogoClick?: () => void;
  className?: string;
  id?: string;
}

/**
 * Navigation Component - Migrated to use new grid system
 * 
 * Uses Row, Col, and Stack components for consistent layout and responsive behavior.
 * Provides better maintainability and visual consistency across all pages.
 */
export const Navigation: React.FC<NavigationProps> = ({
  variant = 'default',
  sticky = false,
  transparent = false,
  logo,
  links = [],
  actions,
  onLogoClick,
  className,
  id,
  ...rest
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <StyledNavigation
      variant={variant}
      sticky={sticky}
      transparent={transparent}
      className={className}
      id={id}
      {...rest}
    >
      <Container maxWidth="xl" padding="none">
        <Row align="center" justify="space-between" gap="lg">
          {/* Logo Section */}
          <Col span={{ xs: 6, md: 4 }}>
            <div 
              onClick={onLogoClick} 
              style={{ cursor: onLogoClick ? 'pointer' : 'default' }}
            >
              {logo || (
                <Text variant="body" size="lg" color="primary">
                  Fairfield Airport Cars
                </Text>
              )}
            </div>
          </Col>

          {/* Navigation Links - Hidden on mobile */}
          <Col span={{ xs: 12, md: 4 }}>
            <div style={{ display: 'none' }}>
              <Stack direction="horizontal" spacing="lg" justify="center">
                {links.map((link, index) => (
                  <NavigationLink
                    key={index}
                    href={link.href}
                    active={link.active || false}
                    variant={variant}
                  >
                    {link.label}
                  </NavigationLink>
                ))}
              </Stack>
            </div>
          </Col>

          {/* Actions Section */}
          <Col span={{ xs: 6, md: 4 }}>
            <Stack direction="horizontal" spacing="md" justify="end">
              {actions}
              <MobileMenuButton onClick={toggleMobileMenu}>
                <Text size="lg">☰</Text>
              </MobileMenuButton>
            </Stack>
          </Col>
        </Row>

        {/* Mobile Menu */}
        <MobileMenu isOpen={mobileMenuOpen}>
          <Stack direction="vertical" spacing="md">
            {links.map((link, index) => (
              <NavigationLink
                key={index}
                href={link.href}
                active={link.active || false}
                variant={variant}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </NavigationLink>
            ))}
          </Stack>
        </MobileMenu>
      </Container>
    </StyledNavigation>
  );
}; 