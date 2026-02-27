'use client';

import React, { useState } from 'react';
import { Container, Stack, Box, Button, Text, H2, StatusMessage, Input } from '@/design/ui';

export default function TestEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [emailAddress, setEmailAddress] = useState('test@example.com');

  const sendTestEmail = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/email/simple-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailAddress
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({ success: true, message: 'Email sent successfully!' });
      } else {
        setResult({ success: false, message: `Error: ${data.error || 'Unknown error'}` });
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="4xl" padding="xl">
      <Stack spacing="xl">
        <Box>
          <H2>Email Service Test</H2>
          <Text color="secondary">
            Test the email service by sending a test email to verify it's working correctly.
          </Text>
        </Box>

        <Box variant="elevated" padding="lg">
          <Stack spacing="md" align="center">
            <Stack spacing="sm" style={{ width: '100%', maxWidth: '400px' }}>
              <Text weight="medium">Email Address:</Text>
              <Input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="Enter email address"
              />
            </Stack>
            
            <Button
              onClick={sendTestEmail}
              disabled={isLoading || !emailAddress}
              variant="primary"
              size="lg"
              text={isLoading ? 'Sending...' : 'Send Test Email'}
            />
            
            <Text size="sm" color="secondary" align="center">
              This will send a test booking confirmation email to the address above
            </Text>
          </Stack>
        </Box>

        {result && (
          <StatusMessage
            type={result.success ? 'success' : 'error'}
            message={result.message}
          />
        )}

        <Box variant="outlined" padding="lg">
          <Stack spacing="md">
            <H2 size="lg">Email Service Status</H2>
            <Text>
              <strong>Environment Variables:</strong>
            </Text>
            <Text size="sm" color="secondary">
              • EMAIL_HOST: {process.env.NEXT_PUBLIC_EMAIL_HOST ? '✅ Set' : '❌ Not set'}
            </Text>
            <Text size="sm" color="secondary">
              • EMAIL_PORT: {process.env.NEXT_PUBLIC_EMAIL_PORT ? '✅ Set' : '❌ Not set'}
            </Text>
            <Text size="sm" color="secondary">
              • EMAIL_USER: {process.env.NEXT_PUBLIC_EMAIL_USER ? '✅ Set' : '❌ Not set'}
            </Text>
            <Text size="sm" color="secondary">
              • EMAIL_PASS: {process.env.NEXT_PUBLIC_EMAIL_PASS ? '✅ Set' : '❌ Not set'}
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
