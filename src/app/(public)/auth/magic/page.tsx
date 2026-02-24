'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Stack, Text, LoadingSpinner, Button } from '@/design/ui';

export default function MagicLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verify = async () => {
      if (!searchParams) return;
      const token = searchParams.get('token');
      const email = searchParams.get('email');
      const redirect = searchParams.get('redirect') || '/bookings';

      if (!token || !email) {
        setStatus('error');
        setErrorMessage('Invalid or missing link information.');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token, email }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error || 'Failed to verify link');
        }

        router.replace(redirect);
      } catch (error) {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to verify link');
      }
    };

    verify();
  }, [router, searchParams]);

  if (status === 'loading') {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>Verifying your link...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing="xl" align="center">
        <Text color="error">{errorMessage}</Text>
        <Button onClick={() => router.push('/find-booking')}>Request a New Link</Button>
      </Stack>
    </Container>
  );
}
