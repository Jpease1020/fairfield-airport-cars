'use client';

import React from 'react';
import Link from 'next/link';
import {
  Text,
  Container,
  Stack,
  Box,
  H1,
  H4
} from '@/design/ui';

export default function SmsTermsContent() {
  return (
    <>
      {/* Hero Section */}
      <Container maxWidth="full" padding="xl" variant="section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 align="center" data-testid="sms-terms-title">
              SMS Terms & Conditions
            </H1>
            <Text variant="lead" align="center" size="lg" data-testid="sms-terms-effective-date">
              Effective Date: February 2025
            </Text>
          </Stack>
        </Stack>
      </Container>

      {/* Content Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="lg">
          <Box data-testid="sms-terms-program">
            <Stack spacing="md">
              <H4>Program Name</H4>
              <Text>
                Fairfield Airport Car Service SMS Alerts
              </Text>
            </Stack>
          </Box>

          <Box data-testid="sms-terms-description">
            <Stack spacing="md">
              <H4>1. Program Description</H4>
              <Text>
                By opting in to SMS messages from Fairfield Airport Car Service, you consent to receive text messages related to our airport transportation services. These messages may include:
              </Text>
              <Stack spacing="sm">
                <Text>{'\u2022'} Booking confirmations and updates</Text>
                <Text>{'\u2022'} Pickup reminders (typically 24 hours before your scheduled ride)</Text>
                <Text>{'\u2022'} Driver status notifications (assignment, en route, arrival)</Text>
                <Text>{'\u2022'} Post-ride feedback requests</Text>
                <Text>{'\u2022'} Occasional promotional offers and deals</Text>
              </Stack>
            </Stack>
          </Box>

          <Box data-testid="sms-terms-consent">
            <Stack spacing="md">
              <H4>2. Consent & Opt-In</H4>
              <Text>
                You may opt in to receive SMS messages by checking the SMS consent checkbox during the booking process on our website at fairfieldairportcar.com. By checking the box labeled &quot;I agree to receive SMS messages from Fairfield Airport Car Service,&quot; you provide your express written consent to receive text messages at the phone number you provide.
              </Text>
              <Text>
                Consent is not required as a condition of purchasing any goods or services. You may book a ride without opting in to SMS messages.
              </Text>
            </Stack>
          </Box>

          <Box data-testid="sms-terms-frequency">
            <Stack spacing="md">
              <H4>3. Message Frequency</H4>
              <Text>
                Message frequency varies based on your booking activity. Transactional messages (confirmations, reminders, driver updates) are sent as needed when you have an active booking. Promotional messages are sent no more than 4 times per month.
              </Text>
            </Stack>
          </Box>

          <Box data-testid="sms-terms-costs">
            <Stack spacing="md">
              <H4>4. Message & Data Rates</H4>
              <Text>
                Message and data rates may apply. Fairfield Airport Car Service does not charge for SMS messages, but your mobile carrier&apos;s standard messaging rates may apply. Please contact your carrier for details about your messaging plan.
              </Text>
            </Stack>
          </Box>

          <Box data-testid="sms-terms-optout">
            <Stack spacing="md">
              <H4>5. Opt-Out Instructions</H4>
              <Text>
                You can opt out of receiving SMS messages at any time by replying STOP to any message you receive from us. After you send STOP, you will receive a one-time confirmation message. After that, you will no longer receive SMS messages from us.
              </Text>
              <Text>
                You may also opt out by unchecking the SMS consent checkbox during your next booking, or by contacting us directly.
              </Text>
            </Stack>
          </Box>

          <Box data-testid="sms-terms-help">
            <Stack spacing="md">
              <H4>6. Help</H4>
              <Text>
                For help or questions about our SMS program, reply HELP to any message, or contact us at:
              </Text>
              <Stack spacing="sm">
                <Text>{'\u2022'} Text: (646) 221-6370</Text>
                <Text>{'\u2022'} Email: rides@fairfieldairportcar.com</Text>
              </Stack>
            </Stack>
          </Box>

          <Box data-testid="sms-terms-carriers">
            <Stack spacing="md">
              <H4>7. Supported Carriers</H4>
              <Text>
                SMS messages are supported on all major US carriers including AT&T, Verizon, T-Mobile, Sprint, and others. Carriers are not liable for delayed or undelivered messages.
              </Text>
            </Stack>
          </Box>

          <Box data-testid="sms-terms-privacy">
            <Stack spacing="md">
              <H4>8. Privacy</H4>
              <Text>
                Your phone number and SMS consent status are stored securely and used only for the purposes described in this policy. We do not sell, rent, or share your phone number with third parties for marketing purposes. For more details, see our{' '}
                <Link href="/privacy" style={{ textDecoration: 'underline' }}>Privacy Policy</Link>.
              </Text>
            </Stack>
          </Box>

          <Box data-testid="sms-terms-contact">
            <Stack spacing="md">
              <H4>9. Contact Us</H4>
              <Text>
                Fairfield Airport Car Service
              </Text>
              <Stack spacing="sm">
                <Text>Text: (646) 221-6370</Text>
                <Text>Email: rides@fairfieldairportcar.com</Text>
                <Text>Web: fairfieldairportcar.com</Text>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </>
  );
}
