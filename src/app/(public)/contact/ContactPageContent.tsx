'use client';

import React from 'react';
import { Container, Stack, Box, H1, H2, Text, GridSection, Button, Input, Label, Textarea } from '@/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';

export default function ContactPageContent() {
  // Get CMS data from provider - extract only what this page needs
  const { cmsData: allCmsData } = useCMSData();
  const contactData = allCmsData?.contact || {};
  
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
              {contactData?.['title'] || 'Contact Us'}
            </H1>
            <Text 
              variant="lead" 
              align="center" 
              size="lg" 
              cmsId="subtitle" 
            >
              {contactData?.['subtitle'] || 'Get in touch with us for bookings, support, or questions'}
            </Text>
          </Stack>
        </Stack>
      </Container>

      {/* Main Content Section */}
      <Container maxWidth="2xl" padding="xl">
        <GridSection variant="content" columns={2}>
          {/* Contact Information */}
          <Stack spacing="lg">
            <H2 cmsId="contact-info-title">
              {contactData?.['contact-info-title'] || 'Contact Information'}
            </H2>
            
            <Box variant="elevated" padding="lg">
              <Stack spacing="md">
                <Text weight="bold" cmsId="phone-label">
                  {contactData?.['phone-label'] || 'Phone'}
                </Text>
                <Text cmsId="phone-value">
                  {contactData?.['phone-value'] || '(203) 555-0123'}
                </Text>
              </Stack>
            </Box>

            <Box variant="elevated" padding="lg">
              <Stack spacing="md">
                <Text weight="bold" cmsId="email-label">
                  {contactData?.['email-label'] || 'Email'}
                </Text>
                <Text cmsId="email-value">
                  {contactData?.['email-value'] || 'info@fairfieldairportcars.com'}
                </Text>
              </Stack>
            </Box>

            <Box variant="elevated" padding="lg">
              <Stack spacing="md">
                <Text weight="bold" cmsId="address-label">
                  {contactData?.['address-label'] || 'Address'}
                </Text>
                <Text cmsId="address-value">
                  {contactData?.['address-value'] || '123 Main Street, Fairfield, CT 06824'}
                </Text>
              </Stack>
            </Box>

            <Box variant="elevated" padding="lg">
              <Stack spacing="md">
                <Text weight="bold" cmsId="hours-label">
                  {contactData?.['hours-label'] || 'Business Hours'}
                </Text>
                <Text cmsId="hours-value">
                  {contactData?.['hours-value'] || '24/7 - We are always available for your transportation needs'}
                </Text>
              </Stack>
            </Box>
          </Stack>

          {/* Contact Form */}
          <Stack spacing="lg">
            <H2 cmsId="contact-form-title">
              {contactData?.['contact-form-title'] || 'Send us a Message'}
            </H2>
            
            <Box variant="elevated" padding="lg">
              <Stack spacing="md">
                <div>
                  <Label htmlFor="name" cmsId="contact-form-name-label">
                    {contactData?.['form-name-label'] || 'Name'}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={contactData?.['form-name-placeholder'] || 'Your full name'}
                  />
                </div>

                <div>
                  <Label htmlFor="email" cmsId="contact-form-email-label">
                    {contactData?.['form-email-label'] || 'Email'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={contactData?.['form-email-placeholder'] || 'your.email@example.com'}
                  />
                </div>

                <div>
                  <Label htmlFor="phone" cmsId="contact-form-phone-label">
                    {contactData?.['form-phone-label'] || 'Phone'}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={contactData?.['form-phone-placeholder'] || '(203) 555-0123'}
                  />
                </div>

                <div>
                  <Label htmlFor="subject" cmsId="form-subject-label">
                    {contactData?.['form-subject-label'] || 'Subject'}
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder={contactData?.['form-subject-placeholder'] || 'How can we help you?'}
                  />
                </div>

                <div>
                  <Label htmlFor="message" cmsId="form-message-label">
                    {contactData?.['form-message-label'] || 'Message'}
                  </Label>
                  <Textarea
                    id="message"
                    rows={4}
                    placeholder={contactData?.['form-message-placeholder'] || 'Tell us more about your needs...'}
                  />
                </div>

                <Button
                  variant="primary"
                  cmsId="form-submit-button"
                >
                  {contactData?.['form-submit-button'] || 'Send Message'}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </GridSection>
      </Container>

      {/* Emergency Contact Section */}
      <Container maxWidth="2xl" padding="xl">
        <Box variant="elevated" padding="lg">
          <Stack spacing="md" align="center">
            <H2 cmsId="emergency-title">
              {contactData?.['emergency-title'] || 'Emergency Contact'}
            </H2>
            <Text align="center" cmsId="emergency-description">
              {contactData?.['emergency-description'] || 'For urgent transportation needs or immediate assistance, please call our emergency line.'}
            </Text>
            <Button
              variant="primary"
              size="lg"
              cmsId="emergency-button"
            >
              {contactData?.['emergency-button'] || 'Call Emergency Line: (203) 555-0123'}
            </Button>
          </Stack>
        </Box>
      </Container>
    </>
  );
}
