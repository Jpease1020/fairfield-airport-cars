'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, signInWithGoogle, authService } from '@/lib/services/auth-service';
import { auth } from '@/lib/utils/firebase';
import { browserLocalPersistence, setPersistence } from 'firebase/auth';
import { 
  Container,
  Stack,
  H1,
  H2,
  Text,
  Box,
  Button,
  ToastProvider,
  Input,
  Label,
  spacing,
} from '@/design/ui';
import styled from 'styled-components';
import { useCMSData } from '@/design/providers/CMSDataProvider';

// Styled components for login page
const StyledForm = styled.form`
  width: 100%;
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: ${spacing.sm} 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-color);
  }
  
  &::before {
    margin-right: ${spacing.sm};
  }
  
  &::after {
    margin-left: ${spacing.sm};
  }
`;

export default function LoginFormClient() {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const pageCmsData = allCmsData?.login || {};
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const ensureLocalPersistence = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch (persistenceError) {
      console.warn('Failed to set local auth persistence:', persistenceError);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await ensureLocalPersistence();
      await login(email, password);
      const current = auth.currentUser;
      if (current && await authService.isAdmin(current.uid)) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (_error) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await ensureLocalPersistence();
      await signInWithGoogle();
      const current = auth.currentUser;
      if (current && await authService.isAdmin(current.uid)) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (_error) {
      setError('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToastProvider>
      <Container maxWidth="lg" padding="xl" data-testid="login-page-container">
          <Stack spacing="xl" align="center" data-testid="login-form-stack">
            <Stack spacing="md" align="center" data-testid="login-header-stack">
              <H1 
                align="center" 

                data-testid="login-title"
              >
                {pageCmsData?.['login-title'] || 'Welcome Back'}
              </H1>
              <H2 
                align="center" 
                variant="default"

                data-testid="login-subtitle"
              >
                {pageCmsData?.['login-subtitle'] || 'Sign in to your account'}
              </H2>
            </Stack>
            
            <StyledForm onSubmit={handleLogin} id="login-form" data-testid="login-form">
              <Stack spacing="md" align="center">
                
                  <Label htmlFor="email" data-testid="email-label">
                    {pageCmsData?.['login-form-email-label']}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    data-testid="email-input"
                    fullWidth={true}
                  />
                
                
                  <Label htmlFor="password" data-testid="password-label">
                    {pageCmsData?.['login-form-password-label']}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    data-testid="password-input"
                    fullWidth={true}
                  />
                
                
                {error && (
                  <Box variant="elevated" padding="sm" data-testid="login-error-message">
                    <Text>
                      {pageCmsData?.['login-error-icon'] || '❌'} {error}
                    </Text>
                  </Box>
                )}
                
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth={true}  
                  disabled={loading}

                  data-testid="sign-in-button"
                >
                  {pageCmsData?.[loading ? 'form.signInButtonLoading' : 'form.signInButton'] || (loading ? 'Signing In...' : 'Sign In')}
                </Button>
              </Stack>
            </StyledForm>
            
            <OrDivider data-testid="login-or-divider">
              <Text variant="small" color="muted">
                {pageCmsData?.['login-form-or-separator'] || 'or'}
              </Text>
            </OrDivider>
            
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              size="lg"
              disabled={loading}

              data-testid="google-sign-in-button"
              fullWidth={true}
            >
              {pageCmsData?.[loading ? 'form.googleSignInButtonLoading' : 'form.googleSignInButton'] || (loading ? 'Signing In...' : 'Continue with Google')}
            </Button>
            
          </Stack>
      </Container>
    </ToastProvider>
  );
}
