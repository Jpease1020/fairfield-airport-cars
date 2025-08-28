'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '../layout/containers/Container';
import { Box } from '../layout/content/Box';
import { Stack } from '../layout/framing/Stack';
import { Text } from '../components/base-components/text/Text';
import { useInteractionMode } from '../providers/InteractionModeProvider';

// Helper function to get field value from CMS
function getCMSField(cmsData: any, fieldPath: string, defaultValue: string = ''): string {
  if (!cmsData) return defaultValue;
  
  const resolvePath = (obj: any, path: string[]): unknown => {
    let cur: any = obj;
    for (const seg of path) {
      if (cur && typeof cur === 'object' && seg in cur) {
        cur = cur[seg as keyof typeof cur];
      } else {
        return undefined;
      }
    }
    return cur;
  };

  const value = resolvePath(cmsData, fieldPath.split('.'));
  return typeof value === 'string' ? (value as string) : defaultValue;
}

interface FooterProps {
  cmsData?: any;
}

export const Footer: React.FC<FooterProps> = ({ cmsData }) => {
  const { mode } = useInteractionMode();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { 
      label: getCMSField(cmsData, 'links-about-label', 'About'), 
      href: '/about' 
    },
    { 
      label: getCMSField(cmsData, 'links-help-label', 'Help'), 
      href: '/help' 
    },
    { 
      label: getCMSField(cmsData, 'links-privacy-label', 'Privacy'), 
      href: '/privacy' 
    },
    { 
      label: getCMSField(cmsData, 'links-terms-label', 'Terms'), 
      href: '/terms' 
    },
    { 
      label: getCMSField(cmsData, 'links-contact-label', 'Contact'), 
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
              data-cms-id="company-name"
              mode={mode}
            >
              {getCMSField(cmsData, 'companyName', 'Fairfield Airport Cars')} {getCMSField(cmsData, 'licensed', '✅ Licensed & Insured')}
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
                  data-cms-id="phone"
                  mode={mode}
                >
                  {getCMSField(cmsData, 'phone', 'Contact support for phone number')}
                </Text>
                <Text 
                  size="sm" 
                  color="secondary"
                  data-cms-id="email"
                  mode={mode}
                >
                  {getCMSField(cmsData, 'email', '✉️ rides@fairfieldairportcars.com')}
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
                data-cms-id="copyright"
                mode={mode}
              >
                {getCMSField(cmsData, 'copyright', `© ${currentYear} Fairfield Airport Cars. All rights reserved.`)}
              </Text>
            </Stack>
          </Stack>          
        </Container>
      </Stack>
    </Box>
  );
}; 