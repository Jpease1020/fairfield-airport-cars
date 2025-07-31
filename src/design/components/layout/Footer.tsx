'use client';

import React from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, transitions } from '../../design-system/tokens';
import { Text } from '../ui-components/Text';
import { Container } from '../grid/Container';

import { Stack } from '../grid/Container';

// Styled footer component
const StyledFooter = styled.footer.withConfig({
  shouldForwardProp: (prop) => !['variant', 'compact'].includes(prop)
})<{
  variant: 'default' | 'minimal' | 'elevated';
  compact: boolean;
}>`
  width: 100%;
  transition: all 0.3s ease-in-out;

  ${({ variant }) => {
    switch (variant) {
      case 'default':
        return `
          background-color: ${colors.background.secondary};
          border-top: 1px solid ${colors.border.default};
          padding: ${spacing.xl} 0;
        `;
      case 'minimal':
        return `
          background-color: transparent;
          border-top: 1px solid ${colors.border.default};
          padding: ${spacing.lg} 0;
        `;
      case 'elevated':
        return `
          background-color: ${colors.background.primary};
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
          padding: ${spacing.xl} 0;
        `;
      default:
        return `
          background-color: ${colors.background.secondary};
          border-top: 1px solid ${colors.border.default};
          padding: ${spacing.xl} 0;
        `;
    }
  }}

  ${({ compact }) => compact && `
    padding: ${spacing.md} 0;
  `}
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl};
`;

const FooterMain = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${spacing.xl};
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const FooterSectionTitle = styled(Text)`
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm};
`;

const FooterLink = styled.a.withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop)
})<{
  variant: 'default' | 'minimal' | 'elevated';
}>`
  text-decoration: none;
  transition: ${transitions.default};
  padding: ${spacing.xs} 0;

  ${({ variant }) => {
    switch (variant) {
      case 'default':
        return `
          color: ${colors.text.secondary};
          &:hover {
            color: ${colors.primary[600]};
          }
        `;
      case 'minimal':
        return `
          color: ${colors.text.muted};
          &:hover {
            color: ${colors.text.secondary};
          }
        `;
      default:
        return `
          color: ${colors.text.secondary};
          &:hover {
            color: ${colors.primary[600]};
          }
        `;
    }
  }}
`;

const FooterBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${spacing.lg};
  border-top: 1px solid ${colors.border.default};
  gap: ${spacing.md};

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${spacing.md};
  align-items: center;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${borderRadius.pill};
  background-color: ${colors.background.tertiary};
  color: ${colors.text.secondary};
  transition: ${transitions.default};
  text-decoration: none;

  &:hover {
    background-color: ${colors.primary[600]};
    color: ${colors.text.white};
    transform: translateY(-2px);
  }
`;

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  platform: string;
  href: string;
  icon: string;
}

export interface FooterProps {
  variant?: 'default' | 'minimal' | 'elevated';
  compact?: boolean;
  logo?: React.ReactNode;
  sections?: FooterSection[];
  socialLinks?: SocialLink[];
  copyright?: string;
  className?: string;
  id?: string;
}

export const Footer: React.FC<FooterProps> = ({
  variant = 'default',
  compact = false,
  logo,
  sections = [],
  socialLinks = [],
  copyright = '© 2024 Fairfield Airport Cars. All rights reserved.',
  className,
  id,
  ...rest
}) => {
  return (
    <StyledFooter
      variant={variant}
      compact={compact}
      className={className}
      id={id}
      {...rest}
    >
      <Container maxWidth="xl">
        <FooterContent>
          <FooterMain>
            {/* Logo and Description Section */}
            <FooterSection>
              {logo || (
                <Text variant="body" size="lg" color="primary" fontWeight="bold">
                  Fairfield Airport Cars
                </Text>
              )}
              <Text variant="body" size="sm" color="secondary">
                Professional airport transportation service in Fairfield. 
                Reliable, comfortable, and on-time.
              </Text>
              {socialLinks.length > 0 && (
                <SocialLinks>
                  {socialLinks.map((social, index) => (
                    <SocialLink key={index} href={social.href} target="_blank" rel="noopener noreferrer">
                      {social.icon}
                    </SocialLink>
                  ))}
                </SocialLinks>
              )}
            </FooterSection>

            {/* Dynamic Sections */}
            {sections.map((section, index) => (
              <FooterSection key={index}>
                <FooterSectionTitle variant="body" size="md" fontWeight="semibold">
                  {section.title}
                </FooterSectionTitle>
                <Stack spacing="xs">
                  {section.links.map((link, linkIndex) => (
                    <FooterLink
                      key={linkIndex}
                      href={link.href}
                      variant={variant}
                    >
                      {link.label}
                    </FooterLink>
                  ))}
                </Stack>
              </FooterSection>
            ))}
          </FooterMain>

          {/* Footer Bottom */}
          <FooterBottom>
            <Text variant="body" size="sm" color="secondary">
              {copyright}
            </Text>
            <Stack direction="horizontal" spacing="md">
              <FooterLink href="/privacy" variant={variant}>
                Privacy Policy
              </FooterLink>
              <FooterLink href="/terms" variant={variant}>
                Terms of Service
              </FooterLink>
            </Stack>
          </FooterBottom>
        </FooterContent>
      </Container>
    </StyledFooter>
  );
}; 