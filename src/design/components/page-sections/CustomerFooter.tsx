'use client';

import React from 'react';
import Link from 'next/link';
import { Container, Stack, Text, Span, EditableText, ContentBox } from '@/design/ui';

export const CustomerFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'About', href: '/about' },
    { name: 'Help', href: '/help' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
    { name: 'Contact', href: '/help' },
  ];

  return (
    <ContentBox variant="elevated" padding="xl">
      <Container maxWidth="xl">
        <Stack spacing="xl">
          {/* Main Footer Content */}
          <Stack direction="horizontal" spacing="lg" align="center" justify="space-between">
            {/* Company Info */}
            <Stack spacing="md">
              <Stack spacing="sm">
                <Text variant="lead" weight="semibold">
                  <EditableText field="footer.companyName">Fairfield Airport Cars</EditableText>
                </Text>
                <Text size="sm" color="secondary">
                  <EditableText field="footer.tagline">Professional airport transportation services</EditableText>
                </Text>
              </Stack>
              
              {/* Contact Info */}
              <Stack spacing="xs">
                <Text size="sm" color="secondary">
                  <EditableText field="footer.phone">📞 (203) 555-0123</EditableText>
                </Text>
                <Text size="sm" color="secondary">
                  <EditableText field="footer.email">✉️ info@fairfieldairportcars.com</EditableText>
                </Text>
              </Stack>
            </Stack>

            {/* Quick Links */}
            <Stack spacing="md">
              <Text weight="semibold" size="sm">Quick Links</Text>
              <Stack direction="horizontal" spacing="md">
                {footerLinks.map((link) => (
                  <Link key={link.name} href={link.href}>
                    <Text size="sm" color="secondary" style={{ textDecoration: 'none' }}>
                      <EditableText field={`footer.link.${link.name.toLowerCase()}`}>
                        {link.name}
                      </EditableText>
                    </Text>
                  </Link>
                ))}
              </Stack>
            </Stack>
          </Stack>

          {/* Bottom Bar */}
          <Stack direction="horizontal" spacing="md" align="center" justify="space-between">
            <Text size="sm" color="secondary">
              <EditableText field="footer.copyright" defaultValue={`© ${currentYear} Fairfield Airport Cars. All rights reserved.`}>
                © {currentYear} Fairfield Airport Cars. All rights reserved.
              </EditableText>
            </Text>
            
            <Stack direction="horizontal" spacing="md">
              <Text size="sm" color="secondary">
                <EditableText field="footer.serving">Serving Fairfield County</EditableText>
              </Text>
              <Text size="sm" color="secondary">
                <EditableText field="footer.licensed">Licensed & Insured</EditableText>
              </Text>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </ContentBox>
  );
}; 