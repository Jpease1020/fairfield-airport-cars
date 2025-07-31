'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '../layout/containers/Container';
import { Stack } from '../layout/grid/Stack';
import { Text, Span } from '../ui-components/Text';
import { EditableText } from '../ui-components/EditableSystem';

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
    <Container maxWidth="xl">
      <Stack spacing="lg" align="center">
        {/* Main Footer Content */}
        <Stack direction="horizontal" spacing="lg" align="center" justify="space-between">
          {/* Company Info */}
          <Stack spacing="sm">
            <Text variant="lead">
              <EditableText field="footer.companyName">Fairfield Airport Cars</EditableText>
            </Text>
            <Text size="sm" color="secondary">
              <EditableText field="footer.tagline">Professional airport transportation services</EditableText>
            </Text>
          </Stack>

          {/* Quick Links */}
          <Stack direction="horizontal" spacing="md">
            {footerLinks.map((link) => (
              <Link key={link.name} href={link.href}>
                <Text size="sm" color="secondary">
                  <EditableText field={`footer.link.${link.name.toLowerCase()}`}>
                    {link.name}
                  </EditableText>
                </Text>
              </Link>
            ))}
          </Stack>
        </Stack>

        {/* Bottom Bar */}
        <Stack direction="horizontal" spacing="md" align="center" justify="space-between">
          <Text size="sm" color="secondary">
            <EditableText field="footer.copyright" defaultValue={`© ${currentYear} Fairfield Airport Cars. All rights reserved.`}>
              © {currentYear} Fairfield Airport Cars. All rights reserved.
            </EditableText>
          </Text>
          
          <Stack direction="horizontal" spacing="sm">
            <Span size="sm" color="secondary">
              <EditableText field="footer.phone">(203) 555-0123</EditableText>
            </Span>
            <Span size="sm" color="secondary">
              <EditableText field="footer.email">info@fairfieldairportcars.com</EditableText>
            </Span>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}; 