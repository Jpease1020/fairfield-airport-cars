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
              cmsId="title" 
            >
              {cmsData?.['title'] || 'Terms of Service'}
            </H1>
            <Text 
              variant="lead" 
              align="center" 
              size="lg" 
              cmsId="subtitle" 
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
              <H4 cmsId="acceptance-title">
                {cmsData?.['acceptance-title'] || '1. Acceptance of Terms'}
              </H4>
              <Text cmsId="acceptance-content">
                {cmsData?.['acceptance-content'] || 'By accessing and using Fairfield Airport Car Service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'}
              </Text>
            </Stack>
          </Box>

          {/* Service Description */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <H4 cmsId="service-description-title">
                {cmsData?.['service-description-title'] || '2. Service Description'}
              </H4>
              <Text cmsId="service-description-content">
                {cmsData?.['service-description-content'] || 'Fairfield Airport Car Service provides professional airport transportation services. We reserve the right to modify or discontinue the service at any time without notice.'}
              </Text>
            </Stack>
          </Box>

          {/* Booking and Cancellation */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <H4 cmsId="booking-cancellation-title">
                {cmsData?.['booking-cancellation-title'] || '3. Booking and Cancellation Policy'}
              </H4>
              <Text cmsId="booking-cancellation-content">
                {cmsData?.['booking-cancellation-content'] || 'All bookings are subject to availability. Cancellation policies vary based on timing: 100% refund for cancellations over 24 hours in advance, 50% refund for cancellations 3-24 hours in advance, and no refund for cancellations under 3 hours.'}
              </Text>
            </Stack>
          </Box>

          {/* Payment Terms */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <H4 cmsId="payment-terms-title">
                {cmsData?.['payment-terms-title'] || '4. Payment Terms'}
              </H4>
              <Text cmsId="payment-terms-content">
                {cmsData?.['payment-terms-content'] || 'Payment is due at the time of booking. We accept major credit cards and digital payment methods. All prices are subject to change without notice.'}
              </Text>
            </Stack>
          </Box>

          {/* Liability and Insurance */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <H4 cmsId="liability-insurance-title">
                {cmsData?.['liability-insurance-title'] || '5. Liability and Insurance'}
              </H4>
              <Text cmsId="liability-insurance-content">
                {cmsData?.['liability-insurance-content'] || 'Our drivers are fully licensed and insured. We maintain comprehensive liability insurance. However, passengers are responsible for their personal belongings and any damages caused by their negligence.'}
              </Text>
            </Stack>
          </Box>

          {/* Privacy Policy */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <H4 cmsId="privacy-policy-title">
                {cmsData?.['privacy-policy-title'] || '6. Privacy Policy'}
              </H4>
              <Text cmsId="privacy-policy-content">
                {cmsData?.['privacy-policy-content'] || 'Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.'}
              </Text>
            </Stack>
          </Box>

          {/* Contact Information */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <H4 cmsId="contact-title">
                {cmsData?.['contact-title'] || '7. Contact Information'}
              </H4>
              <Text cmsId="contact-content">
                {cmsData?.['contact-content'] || 'If you have any questions about these Terms of Service, please contact us at info@fairfieldairportcars.com or text us at (203) 555-0123.'}
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
            cmsId="last-updated"
          >
            {cmsData?.['last-updated'] || 'Last updated: January 1, 2024'}
          </Text>
        </Stack>
      </Container>
    </>
  );
}
