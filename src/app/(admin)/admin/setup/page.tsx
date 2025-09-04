'use client';

// Force dynamic rendering to prevent server-side rendering issues
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/utils/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  Container, 
  Stack, 
  Text, 
  Button, 
  Box,
  H1,
  Alert,
  Link
} from '@/ui';

export default function SetupPage() {

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const setupAdminUser = async () => {
    if (!user) {
      setMessage('Please log in first');
      return;
    }

    setLoading(true);
    try {
      const userRole = {
        uid: user.uid,
        email: user.email,
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'admin'],
        createdAt: new Date(),
        lastLogin: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userRole);
      setMessage('✅ Admin user created successfully! You can now access admin features.');
    } catch (error) {
      console.error('Error creating admin user:', error);
      setMessage('❌ Error creating admin user. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Stack spacing="xl" align="center">
        <Box variant="elevated" padding="xl">
          <Stack spacing="lg" align="center">
            <H1 cmsId="title" >
              Admin Setup
            </H1>
            
            {user ? (
              <Stack spacing="lg">
                <Text cmsId="logged-in-email" >
                  Logged in as: <Text weight="bold">{user.email}</Text>
                </Text>
                <Text cmsId="logged-in-description" >
                  Click the button below to create your admin user role in the database.
                </Text>
                
                <Button 
                  onClick={setupAdminUser}
                  disabled={loading}
                  variant="primary"
                  size="lg"
                  cmsId="logged-in-setup-button"
                  
                >
                  {loading ? 'Setting up...' : 'Setup Admin User'}
                </Button>
                
                {message && (
                  <Alert variant={message.includes('✅') ? 'success' : 'error'}>
                    {message}
                  </Alert>
                )}
              </Stack>
            ) : (
              <Stack spacing="lg">
                <Text cmsId="not-logged-in-message" >
                  Please log in first to set up your admin account.
                </Text>
                <Link href="/login" cmsId='not-logged-in-go-to-login' >
                  Go to Login
                </Link>
              </Stack>
            )}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
} 