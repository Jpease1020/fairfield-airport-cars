'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '../layout/containers/Container';
import { Box } from '../layout/content/Box';
import { Stack } from '../layout/framing/Stack';
import { Text } from '../components/base-components/text/Text';
import { useCMSData } from '../providers/CMSDataProvider';

export const Footer: React.FC = () => {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.footer || {};

  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { 
      label: cmsData?.['links-about-label'] || 'About', 
      href: '/about' 
    },
    { 
      label: cmsData?.['links-help-label'] || 'Help', 
      href: '/help' 
    },
    { 
      label: cmsData?.['links-privacy-label'] || 'Privacy', 
      href: '/privacy' 
    },
    { 
      label: cmsData?.['links-terms-label'] || 'Terms', 
      href: '/terms' 
    },
    { 
      label: cmsData?.['links-contact-label'] || 'Contact', 
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
              cmsId="company-name"
            >
              {cmsData?.['companyName'] || 'Fairfield Airport Cars'} {cmsData?.['licensed'] || '✅ Licensed & Insured'}
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
                  cmsId="phone"
                  
                >
                  {cmsData?.['phone'] || '(646) 221-6370'}
                </Text>
                <Text 
                  size="sm" 
                  color="secondary"
                  cmsId="email"
                  
                >
                  {cmsData?.['email'] || '✉️ rides@fairfieldairportcars.com'}
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
                cmsId="copyright"
                
              >
                {cmsData?.['copyright'] || `© ${currentYear} Fairfield Airport Cars. All rights reserved.`}
              </Text>
            </Stack>
          </Stack>          
        </Container>
      </Stack>
    </Box>
  );
}; 