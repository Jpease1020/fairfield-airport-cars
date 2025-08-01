'use client';

import React from 'react';
import Link from 'next/link';
import { Container, Text, EditableText, Box, Stack } from '@/design/ui';

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
    <Box variant="filled" padding="lg" marginTop="lg" as="footer">
      <Container maxWidth="full" padding="md">
        {/* Main Footer Content */}
        <Stack spacing="xl" margin="lg">
          {/* Desktop: Side by side, Mobile: Stacked */}
          <Stack direction="horizontal" justify="space-between" align="flex-start" spacing="xl" wrap="wrap">
            {/* Company Info */}
            <Stack spacing="sm">
              <EditableText 
                field="footer.companyName"
                variant="lead" 
                weight="semibold" 
                color="primary"
              >
                Fairfield Airport Cars
              </EditableText>
              <EditableText 
                field="footer.tagline"
                size="sm" 
                color="secondary"
              >
                Professional airport transportation services
              </EditableText>
              <Stack spacing="xs">
                <EditableText 
                  field="footer.phone"
                  size="sm" 
                  color="secondary"
                >
                  📞 (203) 555-0123
                </EditableText>
                <EditableText 
                  field="footer.email"
                  size="sm" 
                  color="secondary"
                >
                  ✉️ info@fairfieldairportcars.com
                </EditableText>
              </Stack>
            </Stack>

            {/* Quick Links */}
            <Stack spacing="sm">
              <Text weight="semibold" size="sm" color="primary">Quick Links</Text>
              <Stack direction="horizontal" spacing="md" wrap="wrap">
                {footerLinks.map((link) => (
                  <Link key={link.name} href={link.href}>
                    <Text size="sm" color="secondary">
                      {link.name}
                    </Text>
                  </Link>
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        {/* Bottom Bar - Improved Design */}
        
          <Stack spacing="md" align="center">
            {/* Copyright */}
            <Text 
              size="sm" 
              color="secondary" 
              weight="medium"
              align="center"
            >
              © {currentYear} Fairfield Airport Cars. All rights reserved.
            </Text>
            
            {/* Additional Info - Responsive Layout */}
            <Stack direction="horizontal" spacing="lg" justify="center" align="center" wrap="wrap">
              <Text 
                size="sm" 
                color="secondary"
                weight="medium"
              >
                ✅ Licensed & Insured
              </Text>
            </Stack>
          </Stack>
        
      </Container>
    </Box>
  );
}; 