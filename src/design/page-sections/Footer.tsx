'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '../layout/containers/Container';
import { Box } from '../layout/content/Box';
import { Stack } from '../layout/framing/Stack';
import { Text } from '../components/base-components/text/Text';
import { useCMSData, getCMSField } from '../hooks/useCMSData';
import { useInteractionMode } from '../providers/InteractionModeProvider';

export const Footer: React.FC = () => {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { 
      label: getCMSField(cmsData, 'footer.links.about.label', 'About'), 
      href: '/about' 
    },
    { 
      label: getCMSField(cmsData, 'footer.links.help.label', 'Help'), 
      href: '/help' 
    },
    { 
      label: getCMSField(cmsData, 'footer.links.privacy.label', 'Privacy'), 
      href: '/privacy' 
    },
    { 
      label: getCMSField(cmsData, 'footer.links.terms.label', 'Terms'), 
      href: '/terms' 
    },
    { 
      label: getCMSField(cmsData, 'footer.links.contact.label', 'Contact'), 
      href: '/contact' 
    },
  ];

  return (
    <Box 
      variant="filled" 
      padding="xl"
      margin="none" 
      as="footer"
    >
      <Stack justify="center" align="center" fullWidth>
        <Container maxWidth="6xl" margin="none" spacing="xl">
          {/* Company Info */}
          <Stack spacing="sm" align="center">
            <Text 
              variant="lead" 
              weight="semibold" 
              color="primary"
              data-cms-id="footer.companyName"
              mode={mode}
            >
              {getCMSField(cmsData, 'footer.companyName', 'Fairfield Airport Cars')} {getCMSField(cmsData, 'footer.licensed', '✅ Licensed & Insured')}
            </Text>
          </Stack>
          <Stack 
            direction={{ xs: 'vertical', md: 'horizontal' }} 
            justify={{ xs: 'center', md: 'space-between' }} 
            align={{ xs: 'center', md: 'flex-start' }} 
            spacing={{ xs: 'lg', md: '2xl' }} 
            wrap="wrap"
          >
            <Stack spacing="xs" align="center">
                <Text 
                  size="sm" 
                  color="secondary"
                  data-cms-id="footer.phone"
                  mode={mode}
                >
                  {getCMSField(cmsData, 'footer.phone', 'Contact support for phone number')}
                </Text>
                <Text 
                  size="sm" 
                  color="secondary"
                  data-cms-id="footer.email"
                  mode={mode}
                >
                  {getCMSField(cmsData, 'footer.email', '✉️ rides@fairfieldairportcars.com')}
                </Text>
              </Stack>

            {/* Quick Links */}
            <Stack spacing="sm" align="center">
              <Stack 
                direction={{ xs: 'vertical', sm: 'horizontal' }} 
                spacing={{ xs: 'sm', sm: 'md' }} 
                wrap="wrap"
                align="center"
                justify="center"
              >
                {footerLinks.map((link) => (
                  <Link key={link.label} href={link.href}>
                    <Text size="sm" color="secondary">
                      {link.label}
                    </Text>
                  </Link>
                ))}
              </Stack>
              <Text 
                size="sm" 
                color="secondary" 
                weight="medium"
                align="center"
                data-cms-id="footer.copyright"
                mode={mode}
              >
                {getCMSField(cmsData, 'footer.copyright', `© ${currentYear} Fairfield Airport Cars. All rights reserved.`)}
              </Text>
            </Stack>
          </Stack>          
        </Container>
      </Stack>
    </Box>
  );
}; 