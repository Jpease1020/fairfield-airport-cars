'use client';

import React, { useState } from 'react';
import { Container, Stack, Box, H1, Text, Button, Input, Label, Textarea, Alert } from '@/design/ui';
import { BUSINESS_CONTACT } from '@/utils/constants';

export default function ContactPageContent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <>
      {/* Hero Section */}
      <Container maxWidth="full" padding="xl" variant="section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 align="center">Contact Us</H1>
            <Text variant="lead" align="center" size="lg">
              Get in touch with us for bookings, support, or questions
            </Text>
          </Stack>
        </Stack>
      </Container>

      {/* Main Content Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="xl">
          {/* Contact Info */}
          <Box variant="filled" padding="lg">
            <Stack spacing="md">
              <Text weight="bold" size="lg">Quick Contact</Text>
              <Stack spacing="sm">
                <Text>
                  <strong>Phone:</strong>{' '}
                  <a href={`tel:${BUSINESS_CONTACT.phone.replace(/[^\d+]/g, '')}`}>
                    {BUSINESS_CONTACT.phone}
                  </a>
                </Text>
                <Text>
                  <strong>Email:</strong>{' '}
                  <a href={`mailto:${BUSINESS_CONTACT.ridesEmail}`}>
                    {BUSINESS_CONTACT.ridesEmail}
                  </a>
                </Text>
              </Stack>
              <Text variant="small" color="secondary">
                For immediate assistance with bookings, please call us directly.
              </Text>
            </Stack>
          </Box>

          {/* Contact Form */}
          <Box variant="elevated" padding="lg">
            <form onSubmit={handleSubmit}>
              <Stack spacing="lg">
                <Text weight="bold" size="lg">Send us a Message</Text>

                {status === 'success' && (
                  <Alert variant="success">
                    <Text>Thank you! Your message has been sent. We&apos;ll get back to you soon.</Text>
                  </Alert>
                )}

                {status === 'error' && (
                  <Alert variant="error">
                    <Text>{errorMessage}</Text>
                  </Alert>
                )}

                <Stack spacing="sm">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                </Stack>

                <Stack spacing="sm">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                </Stack>

                <Stack spacing="sm">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(000) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    fullWidth
                  />
                </Stack>

                <Stack spacing="sm">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    fullWidth
                    rows={5}
                  />
                </Stack>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={status === 'sending'}
                  text={status === 'sending' ? 'Sending...' : 'Send Message'}
                />
              </Stack>
            </form>
          </Box>
        </Stack>
      </Container>
    </>
  );
}
