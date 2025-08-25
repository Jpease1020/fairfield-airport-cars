'use client';

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
  colors
} from '@/ui';
import styled from 'styled-components';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

const StyledLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background-color: ${colors.primary[600]};
  color: white;
  text-decoration: none;
  border-radius: 0.375rem;
  font-weight: 500;
  
  &:hover {
    background-color: ${colors.primary[700]};
  }
`;

export default function SetupPage() {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
  
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
      setMessage(getCMSField(cmsData, 'admin-setup-error-pleaseLogin', 'Please log in first'));
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
      setMessage(getCMSField(cmsData, 'admin-setup-success-adminCreated', '✅ Admin user created successfully! You can now access admin features.'));
    } catch (error) {
      console.error('Error creating admin user:', error);
      setMessage(getCMSField(cmsData, 'admin-setup-error-creationFailed', '❌ Error creating admin user. Check console for details.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Stack spacing="xl" align="center">
        <Box variant="elevated" padding="xl">
          <Stack spacing="lg" align="center">
            <H1 data-cms-id="admin.setup.title" mode={mode}>
              {getCMSField(cmsData, 'admin-setup-title', 'Admin Setup')}
            </H1>
            
            {user ? (
              <Stack spacing="lg">
                <Text data-cms-id="admin.setup.sections.loggedIn.email" mode={mode}>
                  {getCMSField(cmsData, 'admin-setup-sections-loggedIn-email', 'Logged in as:')} <Text weight="bold">{user.email}</Text>
                </Text>
                <Text data-cms-id="admin.setup.sections.loggedIn.description" mode={mode}>
                  {getCMSField(cmsData, 'admin-setup-sections-loggedIn-description', 'Click the button below to create your admin user role in the database.')}
                </Text>
                
                <Button 
                  onClick={setupAdminUser}
                  disabled={loading}
                  variant="primary"
                  size="lg"
                  data-cms-id="admin.setup.sections.loggedIn.setupButton"
                  interactionMode={mode}
                >
                  {loading ? getCMSField(cmsData, 'admin-setup-sections-loggedIn-settingUp', 'Setting up...') : getCMSField(cmsData, 'admin-setup-sections-loggedIn-setupButton', 'Setup Admin User')}
                </Button>
                
                {message && (
                  <Alert variant={message.includes('✅') ? 'success' : 'error'}>
                    {message}
                  </Alert>
                )}
              </Stack>
            ) : (
              <Stack spacing="lg">
                <Text data-cms-id="admin.setup.sections.notLoggedIn.message" mode={mode}>
                  {getCMSField(cmsData, 'admin-setup-sections-notLoggedIn-message', 'Please log in first to set up your admin account.')}
                </Text>
                <StyledLink href="/admin/login">
                  {getCMSField(cmsData, 'admin-setup-sections-notLoggedIn-goToLogin', 'Go to Login')}
                </StyledLink>
              </Stack>
            )}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
} 