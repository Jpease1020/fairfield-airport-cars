'use client';

import React from 'react';
import { Container, Stack, Box, H1, Text, Button, Input, Label, Textarea } from '@/ui';
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
        
          {/* Contact Form */}
          
            
            <Box variant="elevated" padding="lg">
            <Stack spacing="lg">
              {/* <Stack spacing="md"> */}
                  <Label htmlFor="name" cmsId="contact-form-name-label">
                    {contactData?.['form-name-label'] || 'Name'}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={contactData?.['form-name-placeholder'] || 'Your full name'}
                  />
                
                  <Label htmlFor="email" cmsId="contact-form-email-label">
                    {contactData?.['form-email-label'] || 'Email'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={contactData?.['form-email-placeholder'] || 'your.email@example.com'}
                  />
                
                  <Label htmlFor="phone" cmsId="contact-form-phone-label">
                    {contactData?.['form-phone-label'] || 'Phone'}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={contactData?.['form-phone-placeholder'] || '(646) 221-6370'}
                  />
                
                  <Label htmlFor="subject" cmsId="form-subject-label">
                    {contactData?.['form-subject-label'] || 'Subject'}
                  </Label>
                  <Textarea
                    id="subject"
                    type="text"
                    placeholder={contactData?.['form-subject-placeholder'] || 'How can we help you?'}
                  />

                <Button
                  variant="primary"
                  cmsId="form-submit-button"
                >
                  {contactData?.['form-submit-button'] || 'Send Message'}
                </Button>
              {/* </Stack> */}
            
          </Stack>
          </Box>
      </Container>
    </>
  );
}
