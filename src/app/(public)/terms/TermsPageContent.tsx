'use client';

import React from 'react';
import {
  Container,
  Stack,
  Box,
  H1,
  H4,
  Text
} from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';

export default function TermsPageContent() {
  // Get CMS data from provider - extract only what this page needs
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.terms || {};
  
  return (
    <>
      {/* Hero Section */}
      <Container maxWidth="full" padding="xl" variant="section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 
              align="center" 
 
            >
              {cmsData?.['title'] || 'Terms of Service'}
            </H1>
            <Text 
              variant="lead" 
              align="center" 
              size="lg" 
 
            >
              {cmsData?.['subtitle'] || 'Please read these terms carefully before using our service'}
            </Text>
          </Stack>
        </Stack>
      </Container>

      {/* Main Content Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="lg">
          {/* Acceptance of Terms */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <H4>
                {cmsData?.['acceptance-title'] || '1. Acceptance of Terms'}
              </H4>
              <Text>
                {cmsData?.['acceptance-content'] || 'By accessing and using Fairfield Airport Car Service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'}
              </Text>
            </Stack>
          </Box>

          {/* Service Description */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <H4>
                {cmsData?.['service-description-title'] || '2. Service Description'}
              </H4>
              <Text>
                {cmsData?.['service-description-content'] || 'Fairfield Airport Car Service provides professional airport transportation services. We reserve the right to modify or discontinue the service at any time without notice.'}
              </Text>
            </Stack>
          </Box>

          {/* Booking and Cancellation */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <H4>
                {cmsData?.['booking-cancellation-title'] || '3. Booking and Cancellation Policy'}
              </H4>
              <Text>
                {cmsData?.['booking-cancellation-content'] || 'All bookings are subject to availability. Cancellations made 24 hours or more in advance have no fee. Cancellations made less than 24 hours in advance are subject to a 25% cancellation fee; less than 12 hours, 50%; less than 6 hours, 75%.'}
              </Text>
            </Stack>
          </Box>

          {/* Payment Terms */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <H4>
                {cmsData?.['payment-terms-title'] || '4. Payment Terms'}
              </H4>
              <Text>
                {cmsData?.['payment-terms-content'] || 'Payment is due at the time of booking. We accept major credit cards and digital payment methods. All prices are subject to change without notice.'}
              </Text>
            </Stack>
          </Box>

          {/* Liability and Insurance */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <H4>
                {cmsData?.['liability-insurance-title'] || '5. Liability and Insurance'}
              </H4>
              <Text>
                {cmsData?.['liability-insurance-content'] || 'Our drivers are fully licensed and insured. We maintain comprehensive liability insurance. However, passengers are responsible for their personal belongings and any damages caused by their negligence.'}
              </Text>
            </Stack>
          </Box>

          {/* Privacy Policy */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <H4>
                {cmsData?.['privacy-policy-title'] || '6. Privacy Policy'}
              </H4>
              <Text>
                {cmsData?.['privacy-policy-content'] || 'Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.'}
              </Text>
            </Stack>
          </Box>

          {/* Contact Information */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <H4>
                {cmsData?.['contact-title'] || '7. Contact Information'}
              </H4>
              <Text>
                {cmsData?.['contact-content'] || 'If you have any questions about these Terms of Service, please contact us at rides@fairfieldairportcar.com or text us at (646) 221-6370.'}
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Container>

      {/* Last Updated */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="md" align="center">
          <Text 
            variant="muted" 
            size="sm" 

          >
            {cmsData?.['last-updated'] || 'Last updated: January 1, 2024'}
          </Text>
        </Stack>
      </Container>
    </>
  );
}
