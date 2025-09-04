'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, signInWithGoogle, authService } from '@/lib/services/auth-service';
import { auth } from '@/lib/utils/firebase';
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
} from '@/ui';
import styled from 'styled-components';
import { useCMSData } from '@/design/providers/CMSDataProvider';

// Styled components for login page
const LoginCard = styled(Box)`
  display: flex;
  justify-content: center;
  transition: transform 0.2s ease-in-out;
  width: 100%;
  
  &:hover {
    transform: translateY(-2px);
  }
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

const LinkText = styled(Text)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: ${spacing.md};
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await login(email, password);
      const current = auth.currentUser;
      if (current && await authService.isAdmin(current.uid)) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
      const current = auth.currentUser;
      if (current && await authService.isAdmin(current.uid)) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToastProvider>
      <Container maxWidth="sm" padding="xl">
        <LoginCard variant="elevated" padding="xl">
          <Stack spacing="xl" align="center">
            <Stack spacing="md" align="center">
              <H1 
                align="center" 
                cmsId="title"
              >
                {pageCmsData?.['login-title'] || 'Welcome Back'}
              </H1>
              <H2 
                align="center" 
                variant="default"
                cmsId="subtitle"
              >
                {pageCmsData?.['login-subtitle'] || 'Sign in to your account'}
              </H2>
            </Stack>
            
            <form onSubmit={handleLogin} id="login-form">
              <Stack spacing="md">
                <div>
                  <Label htmlFor="email">
                    {pageCmsData?.['login-form-email-label']}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">
                    {pageCmsData?.['login-form-password-label']}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                </div>
                
                {error && (
                  <Box variant="elevated" padding="sm">
                    <Text>
                      {pageCmsData?.['login-error-icon'] || '❌'} {error}
                    </Text>
                  </Box>
                )}
                
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  cmsId="sign-in-button"
                >
                  {pageCmsData?.[loading ? 'form.signInButtonLoading' : 'form.signInButton'] || (loading ? 'Signing In...' : 'Sign In')}
                </Button>
              </Stack>
            </form>
            
            <OrDivider>
              <Text variant="small" color="muted">
                {pageCmsData?.['login-form-or-separator'] || 'or'}
              </Text>
            </OrDivider>
            
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              size="lg"
              disabled={loading}
              cmsId="google-sign-in-button"
            >
              {pageCmsData?.[loading ? 'form.googleSignInButtonLoading' : 'form.googleSignInButton'] || (loading ? 'Signing In...' : 'Continue with Google')}
            </Button>
            
            <LinkText variant="small" color="muted">
              {pageCmsData?.['login-form-no-account'] || "Don't have an account?"}{' '}
              <Link href="/register">
                {pageCmsData?.['login-form-signup-link'] || 'Sign up'}
              </Link>
            </LinkText>
            
            <LinkText variant="small" color="muted">
              <Link href="/forgot-password">
                {pageCmsData?.['login-form-forgot-password'] || 'Forgot your password?'}
              </Link>
            </LinkText>
          </Stack>
        </LoginCard>
      </Container>
    </ToastProvider>
  );
}
