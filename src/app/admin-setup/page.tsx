'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange, authService } from '@/lib/services/auth-service';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  Container,
  Stack,
  Text,
  Button,
  LoadingSpinner,
  Alert
} from '@/ui';

export default function AdminSetupPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingAdmin, setSettingAdmin] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [router]);

  const handleSetAsAdmin = async () => {
    if (!user) return;
    
    setSettingAdmin(true);
    setMessage(null);
    setError(null);

    try {
      const success = await authService.setUserAsAdmin(user.uid);
      if (success) {
        setMessage('Successfully set as admin! Redirecting to admin dashboard...');
        setTimeout(() => {
          router.push('/admin');
        }, 2000);
      } else {
        setError('Failed to set as admin. Please try again.');
      }
    } catch (err) {
      setError('Error setting as admin: ' + (err as Error).message);
    } finally {
      setSettingAdmin(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>Loading...</Text>
        </Stack>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <Text>Please log in to access admin setup.</Text>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" padding="xl">
      <Stack spacing="xl" align="center">
        <Text size="xl" weight="bold">Admin Setup</Text>
        
        <Stack spacing="md" align="center">
          <Text>Current User: {user.email}</Text>
          <Text size="sm" variant="muted">UID: {user.uid}</Text>
        </Stack>

        {message && (
          <Alert variant="success">
            <Text>{message}</Text>
          </Alert>
        )}

        {error && (
          <Alert variant="error">
            <Text>{error}</Text>
          </Alert>
        )}

        <Stack spacing="md" align="center">
          <Text>Click the button below to set your account as admin:</Text>
          <Button 
            onClick={handleSetAsAdmin}
            disabled={settingAdmin}
            size="lg"
          >
            {settingAdmin ? (
              <>
                <LoadingSpinner size="sm" />
                Setting as Admin...
              </>
            ) : (
              'Set as Admin'
            )}
          </Button>
        </Stack>

        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Stack>
    </Container>
  );
} 