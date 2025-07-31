'use client';

import React from 'react';
import { Container, Section, Stack, Grid, Col, Text, Link } from '@/design/ui';

export interface FooterLinkData {
  label: string;
  href: string;
}

export interface FooterSectionData {
  title: string;
  links: FooterLinkData[];
}

export interface SocialLinkData {
  platform: string;
  href: string;
  icon: string;
}

export interface FooterProps {
  variant?: 'default' | 'minimal' | 'elevated';
  compact?: boolean;
  logo?: React.ReactNode;
  sections?: FooterSectionData[];
  socialLinks?: SocialLinkData[];
  copyright?: string;
  id?: string;
}

export const Footer: React.FC<FooterProps> = ({
  variant = 'default',
  compact = false,
  logo,
  sections = [],
  socialLinks = [],
  copyright = '© 2024 Fairfield Airport Cars. All rights reserved.',
  id,
  ...rest
}) => {
  // Map variant to section variant
  const getSectionVariant = () => {
    switch (variant) {
      case 'minimal':
        return 'muted';
      case 'elevated':
        return 'alternate';
      default:
        return 'default';
    }
  };

  // Map variant to link color
  const getLinkColor = () => {
    switch (variant) {
      case 'minimal':
        return 'muted';
      default:
        return 'secondary';
    }
  };

  return (
    <Section 
      variant={getSectionVariant()}
      padding={compact ? 'md' : 'xl'}
      margin="none"
      id={id}
      {...rest}
    >
      <Container maxWidth="xl">
        <Stack direction="vertical" spacing="xl">
          {/* Main Footer Content */}
          <Grid cols={12}  >
            {/* Logo and Description Section */}
            <Col span={{ xs: 12, md: 4 }}>
              <Stack direction="vertical" spacing="md">
                {logo || (
                  <Container>
                    <Text variant="body" size="lg" color="primary" fontWeight="bold">
                      Fairfield Airport Cars
                    </Text>
                  </Container>
                )}
                <Container>
                  <Text variant="body" size="sm" color="secondary">
                    Professional airport transportation service in Fairfield. 
                    Reliable, comfortable, and on-time.
                  </Text>
                </Container>
                {socialLinks.length > 0 && (
                  <Container>
                    <Stack direction="horizontal" spacing="md">
                      {socialLinks.map((social, index) => (
                        <Container key={index}>
                          <Link href={social.href}>
                            <Text size="lg">{social.icon}</Text>
                          </Link>
                        </Container>
                      ))}
                    </Stack>
                  </Container>
                )}
              </Stack>
            </Col>

            {/* Footer Sections */}
            {sections.map((section, sectionIndex) => (
              <Col key={sectionIndex} span={{ xs: 6, md: 2 }}>
                <Stack direction="vertical" spacing="md">
                  <Container>
                    <Text variant="body" size="sm" fontWeight="semibold">
                      {section.title}
                    </Text>
                  </Container>
                  <Container>
                    <Stack direction="vertical" spacing="sm">
                      {section.links.map((link, linkIndex) => (
                        <Container key={linkIndex}>
                          <Link href={link.href}>
                            <Text variant="body" size="sm" color={getLinkColor()}>
                              {link.label}
                            </Text>
                          </Link>
                        </Container>
                      ))}
                    </Stack>
                  </Container>
                </Stack>
              </Col>
            ))}
          </Grid>

          {/* Copyright Section */}
          <Container>
            <Stack direction="horizontal" spacing="md" justify="space-between" align="center">
              <Container>
                <Text variant="body" size="sm" color="secondary">
                  {copyright}
                </Text>
              </Container>
              <Container>
                <Stack direction="horizontal" spacing="md">
                  <Link href="/privacy">
                    <Text variant="body" size="sm" color="secondary">
                      Privacy Policy
                    </Text>
                  </Link>
                  <Link href="/terms">
                    <Text variant="body" size="sm" color="secondary">
                      Terms of Service
                    </Text>
                  </Link>
                </Stack>
              </Container>
            </Stack>
          </Container>
        </Stack>
      </Container>
    </Section>
  );
}; 