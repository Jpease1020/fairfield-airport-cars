'use client';

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Container } from '../layout/containers/Container';
import { Box } from '../layout/content/Box';
import { Stack } from '../layout/framing/Stack';
import { Text } from '../components/base-components/text/Text';
import { useCMSData } from '../providers/CMSDataProvider';

// Styled components for responsive company info
const MobileCompanyInfo = styled(Stack)`
  @media (min-width: 1024px) {
    display: none;
  }
`;

const DesktopCompanyInfo = styled(Stack)`
  display: none;
  
  @media (min-width: 1024px) {
    display: flex;
  }
`;

type FooterProps = {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
};

export const Footer: React.FC<FooterProps> = (props) => {
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
      label: 'SMS Terms',
      href: '/sms-terms'
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
      {...props}
    >
      <Stack justify="center" align="center" fullWidth>
        <Container margin="none" spacing={{ xs: 'md', md: 'xl' }}>
          
          {/* Company Info - Mobile/Tablet: Top, Desktop: Hidden */}
          <MobileCompanyInfo spacing="sm" align="center">
            <Text 
              variant="lead" 
              weight="semibold" 
              color="primary"

            >
              {cmsData?.['licensed'] || '✅  Licensed & Insured'}
            </Text>
          </MobileCompanyInfo>
          
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

                  
                >
                  {cmsData?.['phone'] || '📱 Text us: (203) 990-1815'}
                </Text>
                <Text 
                  size="sm" 
                  color="secondary"

                  
                >
                  {cmsData?.['email'] || '✉️ rides@fairfieldairportcar.com'}
                </Text>
              </Stack>

            {/* Company Info - Desktop: Between contact and Quick Links */}
            <DesktopCompanyInfo spacing="sm" align="center">
              <Text 
                variant="lead" 
                weight="semibold" 
                color="primary"

              >
                {cmsData?.['licensed'] || '✅  Licensed & Insured'}
              </Text>
            </DesktopCompanyInfo>

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
