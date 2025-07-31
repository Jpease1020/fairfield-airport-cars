'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, transitions } from '../../system/tokens/tokens';
import { Button } from '@/ui';
import { Text } from '@/ui';
import { Container } from '@/ui';

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

const NavigationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.lg};
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const NavigationLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.lg};
  flex: 1;
  justify-content: center;

  @media (max-width: 768px) {
    display: none;
  }
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

const ActionSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
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
      <Container maxWidth="xl">
        <NavigationContainer>
          <LogoSection onClick={onLogoClick} style={{ cursor: onLogoClick ? 'pointer' : 'default' }}>
            {logo || (
              <Text variant="body" size="lg" color="primary">
                Fairfield Airport Cars
              </Text>
            )}
          </LogoSection>

          <NavigationLinks>
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
          </NavigationLinks>

          <ActionSection>
            {actions}
            <MobileMenuButton onClick={toggleMobileMenu}>
              <Text size="lg">☰</Text>
            </MobileMenuButton>
          </ActionSection>
        </NavigationContainer>

        <MobileMenu isOpen={mobileMenuOpen}>
          <Stack spacing="md">
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

// Import Stack for mobile menu
import { Stack } from '@/ui'; 