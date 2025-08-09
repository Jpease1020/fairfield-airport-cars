'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '../layout/containers/Container';
import { Box } from '../layout/content/Box';
import { Stack } from '../layout/framing/Stack';
import { Text } from '../components/base-components/text/Text';
import { useCMSData, getCMSField } from '../providers/CMSDesignProvider';

export const Footer: React.FC = () => {
  const { cmsData } = useCMSData();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: 'About', href: '/about' },
    { label: 'Help', href: '/help' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Contact', href: '/help' },
  ];

  return (
    <Box variant="filled" padding="lg" margin="none" as="footer">
      <Container maxWidth="2xl" margin="md">
        <Stack 
          direction={{ xs: 'vertical', lg: 'horizontal' }} 
          justify={{ xs: 'center', lg: 'space-between' }} 
          align={{ xs: 'center', lg: 'flex-start' }} 
          spacing={{ xs: 'lg', lg: 'xl' }} 
          wrap="wrap"
        >
          {/* Company Info */}
          <Stack spacing="sm" align="center">
            <Text variant="lead" weight="semibold" color="primary">
              {getCMSField(cmsData, 'footer.companyName', 'Fairfield Airport Cars')}
            </Text>
            <Text size="sm" color="secondary">
              {getCMSField(cmsData, 'footer.tagline', 'Professional airport transportation services')}
            </Text>
            <Stack spacing="xs" align="center">
              <Text size="sm" color="secondary">
                {getCMSField(cmsData, 'footer.phone', '📞 (203) 555-0123')}
              </Text>
              <Text size="sm" color="secondary">
                {getCMSField(cmsData, 'footer.email', '✉️ info@fairfieldairportcars.com')}
              </Text>
            </Stack>
          </Stack>

          {/* Quick Links */}
          <Stack spacing="sm" align="center">
            <Text weight="semibold" size="sm" color="primary">Quick Links</Text>
            <Stack 
              direction={{ xs: 'vertical', sm: 'horizontal' }} 
              spacing={{ xs: 'sm', sm: 'md' }} 
              wrap="wrap"
              align="center"
            >
              {footerLinks.map((link) => (
                <Link key={link.label} href={link.href}>
                  <Text size="sm" color="secondary">
                    {link.label}
                  </Text>
                </Link>
              ))}
            </Stack>
          </Stack>
        </Stack>
        
        {/* Bottom Bar */}
        <Stack spacing="md" align="center" justify="center">
          <Text 
            size="sm" 
            color="secondary" 
            weight="medium"
            align="center"
          >
            © {currentYear} Fairfield Airport Cars. All rights reserved.
          </Text>
          
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