'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/services/auth-service';
import { Container, Stack, H1, Text, Button } from '@/ui';

export default function AdminSetupPage() {
  const { user, isLoggedIn } = useAuth();
  const [isSettingAdmin, setIsSettingAdmin] = useState(false);
  const [message, setMessage] = useState('');

  const handleSetAsAdmin = async () => {
    if (!user) {
      setMessage('❌ You must be logged in to set admin access');
      return;
    }

    setIsSettingAdmin(true);
    setMessage('');

    try {
      const success = await authService.setUserAsAdmin(user.uid);
      if (success) {
        setMessage('✅ Successfully set as admin! You can now access admin pages.');
      } else {
        setMessage('❌ Failed to set admin access. Please try again.');
      }
    } catch (error) {
      console.error('Error setting admin:', error);
      setMessage('❌ Error setting admin access. Please try again.');
    } finally {
      setIsSettingAdmin(false);
    }
  };

  const handleCheckAdminStatus = async () => {
    if (!user) {
      setMessage('❌ You must be logged in to check admin status');
      return;
    }

    try {
      const isAdmin = await authService.isAdmin(user.uid);
      setMessage(isAdmin ? '👑 You are already an admin!' : '❌ You are not an admin yet.');
    } catch (error) {
      console.error('Error checking admin status:', error);
      setMessage('❌ Error checking admin status.');
    }
  };

  if (!isLoggedIn) {
    return (
      <Container>
        <Stack spacing="xl" align="center" justify="center">
          <H1>Admin Setup</H1>
          <Text>You must be logged in to set up admin access.</Text>
          <Button href="/login" variant="primary">
            Go to Login
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing="xl" align="center" justify="center">
        <H1>Admin Setup</H1>
        
        <Stack spacing="md" align="center">
          <Text><strong>Current User:</strong> {user?.email}</Text>
          <Text><strong>User ID:</strong> {user?.uid}</Text>
        </Stack>

        <Stack spacing="md" align="center">
          <Button 
            onClick={handleCheckAdminStatus}
            variant="outline"
            disabled={isSettingAdmin}
          >
            Check Admin Status
          </Button>

          <Button 
            onClick={handleSetAsAdmin}
            variant="primary"
            disabled={isSettingAdmin}
          >
            {isSettingAdmin ? 'Setting Admin...' : 'Make Me Admin'}
          </Button>
        </Stack>

        {message && (
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '0.5rem',
            marginTop: '1rem'
          }}>
            <Text>{message}</Text>
          </div>
        )}

        <Stack spacing="sm" align="center">
          <Text size="sm" variant="muted">
            After setting admin access, you can:
          </Text>
          <Text size="sm" variant="muted">
            • Access /admin pages
          </Text>
          <Text size="sm" variant="muted">
            • See "Admin" link in navigation
          </Text>
          <Text size="sm" variant="muted">
            • Manage the application
          </Text>
        </Stack>
      </Stack>
    </Container>
  );
} 