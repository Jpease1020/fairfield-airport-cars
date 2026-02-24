'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Stack,
  Text,
  Button,
  Input,
  Label,
  RadioButton,
  Box,
  LoadingSpinner,
  H1,
} from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';

export default function FindBookingClient() {
  const { cmsData: allCmsData } = useCMSData();
  const pageCmsData = allCmsData?.['find-booking'] || {};
  const router = useRouter();
  const [lookupType, setLookupType] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSend = async () => {
    if (!identifier.trim()) {
      setError('Please enter your email or phone number');
      return;
    }

    if (lookupType === 'email' && !identifier.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (lookupType === 'email') {
        const response = await fetch('/api/auth/request-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: identifier.trim(), redirect: '/bookings' }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error || 'Failed to send magic link');
        }

        setSuccessMessage('We sent you a secure link. Check your email to access your bookings.');
      } else {
        const response = await fetch('/api/auth/request-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: identifier.trim() }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error || 'Failed to send verification code');
        }

        setOtpSent(true);
        setSuccessMessage('We sent a 6-digit code to your phone.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: identifier.trim(), code: otpCode.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to verify code');
      }

      router.push('/bookings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Container maxWidth="2xl" padding="xl">
      <Stack spacing="xl">
        <Stack spacing="md" align="center">
          <H1 cmsId="find-booking-title">
            {pageCmsData?.['find-booking-title'] || 'Find My Booking'}
          </H1>
          <Text align="center" variant="muted" cmsId="find-booking-description">
            {pageCmsData?.['find-booking-description'] || 'We will send you a secure link or code to access your bookings.'}
          </Text>
        </Stack>

        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <Stack spacing="md">
              <Label cmsId="lookup-by-label">{pageCmsData?.['lookup-by-label'] || 'Lookup By'}</Label>
              <Stack direction="horizontal" spacing="lg">
                <RadioButton
                  id="lookup-email"
                  name="lookup-type"
                  value="email"
                  checked={lookupType === 'email'}
                  onChange={(value) => {
                    setLookupType(value as 'email' | 'phone');
                    setIdentifier('');
                    setOtpCode('');
                    setOtpSent(false);
                    setSuccessMessage(null);
                    setError(null);
                  }}
                  label="Email"
                />
                <RadioButton
                  id="lookup-phone"
                  name="lookup-type"
                  value="phone"
                  checked={lookupType === 'phone'}
                  onChange={(value) => {
                    setLookupType(value as 'email' | 'phone');
                    setIdentifier('');
                    setOtpCode('');
                    setOtpSent(false);
                    setSuccessMessage(null);
                    setError(null);
                  }}
                  label="Phone"
                />
              </Stack>
            </Stack>

            <Stack spacing="sm">
              <Label htmlFor="identifier">
                {lookupType === 'email' ? 'Email Address' : 'Phone Number'}
              </Label>
              <Input
                id="identifier"
                type={lookupType === 'email' ? 'email' : 'tel'}
                value={identifier}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdentifier(e.target.value)}
                placeholder={lookupType === 'email' ? 'your.email@example.com' : '(555) 123-4567'}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    handleSend();
                  }
                }}
              />
            </Stack>

            {otpSent && lookupType === 'phone' && (
              <Stack spacing="sm">
                <Label htmlFor="otpCode">Verification Code</Label>
                <Input
                  id="otpCode"
                  type="text"
                  value={otpCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtpCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                />
                <Button
                  onClick={handleVerifyOtp}
                  disabled={verifying || !otpCode.trim()}
                  variant="primary"
                >
                  {verifying ? 'Verifying...' : 'Verify Code'}
                </Button>
              </Stack>
            )}

            {error && (
              <Box variant="outlined" padding="md">
                <Text color="error">{error}</Text>
              </Box>
            )}

            {successMessage && (
              <Box variant="outlined" padding="md">
                <Text>{successMessage}</Text>
              </Box>
            )}

            <Button
              onClick={handleSend}
              disabled={loading || !identifier.trim()}
              variant="primary"
              cmsId="search-bookings"
            >
              {loading ? 'Sending...' : (lookupType === 'email' ? 'Send Magic Link' : 'Send Code')}
            </Button>
          </Stack>
        </Box>

        {loading && (
          <Stack spacing="md" align="center">
            <LoadingSpinner />
            <Text variant="muted">Sending your verification...</Text>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
