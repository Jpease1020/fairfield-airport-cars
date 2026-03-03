'use client';

import React from 'react';
import styled from 'styled-components';
import { Container, Stack, Box } from '@/design/ui';
import { H1, Text, Button } from '@/design/components/base-components/Components';
import { useCMSData } from '@/design/providers/CMSDataProvider';
import Link from 'next/link';
import { colors } from '@/design/system/tokens/tokens';

// Custom styled component for darker grey background
const DarkerGreyBox = styled(Box)`
  background-color: ${colors.gray[100]};
`;

export default function AboutPageContent() {
  // Get CMS data from provider - extract only what this page needs
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.about || {};
  
  return (
    <>
      {/* Hero Section */}
      <Container maxWidth="full" padding="xl" variant="section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 
              align="center" 
 
            >
              {cmsData?.['title'] || 'About Us'}
            </H1>
            <Text 
              variant="lead" 
              align="center" 
              size="lg" 
 
            >
              {cmsData?.['subtitle'] || 'Your Trusted Airport Transportation Partner'}
            </Text>
          </Stack>
        </Stack>
      </Container>

      {/* Main Content Section */}
      <Container maxWidth="2xl" padding="xl">
        <DarkerGreyBox padding="lg" rounded="md">
          <Stack spacing="lg" align="center">
            <Text 
              align="center" 
              size="lg" 
 
            >
              {cmsData?.['description'] || 'We are Fairfield Airport Car Service, your trusted partner for reliable and comfortable airport transportation. With years of experience, we understand the importance of punctuality and safety. Our professional drivers are background-checked and equipped with clean, well-maintained vehicles to ensure a smooth and enjoyable journey for you.'}
            </Text>
          </Stack>
        </DarkerGreyBox>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="lg" align="center">
          <Text 
            align="center" 
 
          >
            {cmsData?.['cta-subtitle'] || 'Ready to experience premium airport transportation?'}
          </Text>
          
          
            <Link href="/book">
            <Button
              variant="primary"

            >
              {cmsData?.['cta-primary-button'] || 'Book Your Ride'}
            </Button>
          </Link>
        </Stack>
      </Container>
    </>
  );
}
