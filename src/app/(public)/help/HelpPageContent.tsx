'use client';

import React from 'react';
import styled from 'styled-components';
import { 
  Container,
  Stack,
  Box,
  H1,
  H2,
  Text,
  Button
} from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';
import Link from 'next/link';
import { colors } from '@/design/system/tokens/tokens';

// Custom styled component for darker grey background
const DarkerGreyBox = styled(Box)`
  background-color: ${colors.gray[100]};
`;

export default function HelpPageContent() {
  // Get CMS data from provider - extract only what this page needs
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.help || {};
  
  return (
    <>
      {/* Hero Section */}
      <Container maxWidth="full" padding="xl" variant="section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 
              align="center" 
 
            >
              {cmsData?.['title'] || 'Help & Support'}
            </H1>
            <Text 
              variant="lead" 
              align="center" 
              size="lg" 
 
            >
              {cmsData?.['subtitle'] || 'Find answers to common questions and get the help you need'}
            </Text>
          </Stack>
        </Stack>
      </Container>

      {/* Main Content Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="lg">
          {/* Quick Actions */}
          <DarkerGreyBox padding="lg">
            <Stack spacing="md">
              <H2>
                {cmsData?.['quick-actions-title'] || 'Quick Actions'}
              </H2>
              <Stack direction="horizontal" spacing="md">
                <Link href="/book">
                  <Button variant="primary">
                    {cmsData?.['book-ride-button'] || 'Book a Ride'}
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="secondary">
                    {cmsData?.['contact-support-button'] || 'Contact Support'}
                  </Button>
                </Link>
              </Stack>
            </Stack>
          </DarkerGreyBox>

          {/* FAQ Section */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="md">
              <H2>
                {cmsData?.['faq-title'] || 'Frequently Asked Questions'}
              </H2>
              
              <Stack spacing="md">
                <Box variant="outlined" padding="md">
                  <Stack spacing="sm">
                    <Text weight="bold">
                      {cmsData?.['faq-1-question'] || 'How do I book a ride?'}
                    </Text>
                    <Text>
                      {cmsData?.['faq-1-answer'] || 'You can book a ride by clicking the "Book a Ride" button above, or by texting us at (203) 990-1815. Simply provide your pickup location, destination, and preferred time.'}
                    </Text>
                  </Stack>
                </Box>

                <Box variant="outlined" padding="md">
                  <Stack spacing="sm">
                    <Text weight="bold">
                      {cmsData?.['faq-2-question'] || 'What is your cancellation policy?'}
                    </Text>
                    <Text>
                      {cmsData?.['faq-2-answer'] || 'Cancellations made 24 hours or more in advance have no fee. Cancellations made less than 24 hours in advance are subject to a 25% cancellation fee; less than 12 hours in advance, 50%; less than 6 hours in advance, 75%.'}
                    </Text>
                  </Stack>
                </Box>

                <Box variant="outlined" padding="md">
                  <Stack spacing="sm">
                    <Text weight="bold">
                      {cmsData?.['faq-3-question'] || 'How far in advance should I book?'}
                    </Text>
                    <Text>
                      {cmsData?.['faq-3-answer'] || 'We recommend booking at least 24 hours in advance for airport rides, especially during peak travel times. However, we can often accommodate same-day bookings based on availability.'}
                    </Text>
                  </Stack>
                </Box>

                <Box variant="outlined" padding="md">
                  <Stack spacing="sm">
                    <Text weight="bold">
                      {cmsData?.['faq-4-question'] || 'What payment methods do you accept?'}
                    </Text>
                    <Text>
                      {cmsData?.['faq-4-answer'] || 'We accept all major credit cards, debit cards, and digital payment methods. Payment is processed securely at the time of booking.'}
                    </Text>
                  </Stack>
                </Box>

                <Box variant="outlined" padding="md">
                  <Stack spacing="sm">
                    <Text weight="bold">
                      {cmsData?.['faq-5-question'] || 'Do you provide child safety seats?'}
                    </Text>
                    <Text>
                      {cmsData?.['faq-5-answer'] || 'Yes, we can provide child safety seats upon request. Please mention this when booking so we can ensure availability.'}
                    </Text>
                  </Stack>
                </Box>
              </Stack>
            </Stack>
          </Box>

          {/* Contact Information */}
          <DarkerGreyBox padding="lg">
            <Stack spacing="md">
              <H2>
                {cmsData?.['contact-info-title'] || 'Still Need Help?'}
              </H2>
              <Text>
                {cmsData?.['contact-info-description'] || 'If you can\'t find the answer you\'re looking for, our customer service team is here to help.'}
              </Text>
              <Stack direction="horizontal" spacing="md">
                <Text weight="bold">
                  {cmsData?.['phone-label'] || 'Phone:'}
                </Text>
                <Text>
                  {cmsData?.['phone-value'] || 'Text: (203) 990-1815'}
                </Text>
              </Stack>
              <Stack direction="horizontal" spacing="md">
                <Text weight="bold">
                  {cmsData?.['email-label'] || 'Email:'}
                </Text>
                <Text>
                  {cmsData?.['email-value'] || 'rides@fairfieldairportcar.com'}
                </Text>
              </Stack>
            </Stack>
          </DarkerGreyBox>
        </Stack>
      </Container>
    </>
  );
}
