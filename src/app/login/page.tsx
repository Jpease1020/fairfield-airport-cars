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
  spacing
} from '@/ui';
import styled from 'styled-components'; 
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';

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

const LoginForm = styled.form`
  width: 100%;
  
  & > * {
    width: 100%;
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

export default function CustomerLoginPage() {
  const { cmsData } = useCMSData();
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
        router.push('/portal');
      }
    } catch (error) {
      setError(`Failed to log in: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
      const current = auth.currentUser;
      if (current && await authService.isAdmin(current.uid)) {
        router.push('/admin');
      } else {
        router.push('/portal');
      }
    } catch (error) {
      setError(`Failed to sign in with Google: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(e);
  };

  return (
    <ToastProvider>
    
        <Container id="login-section">
          <Stack   align="center">
            <Stack    align="center">
              <H1 align="center">
                {getCMSField(cmsData, 'customer-login-title', 'Welcome Back')}
              </H1>
              <Stack align="center">
                  <H2 align="center" id="login-title">
                    {getCMSField(cmsData, 'login-authTitle', 'Sign in to your account to manage your bookings')}
                  </H2>
                </Stack>
            </Stack>

            <LoginCard variant="elevated" padding="xl" id="login-card">
              <Stack>

                <LoginForm onSubmit={handleFormSubmit} id="login-form">
                  <Stack align="center">
                    <Stack>
                      <Label htmlFor="email">
                        {getCMSField(cmsData, 'customer-login-emailLabel', 'Email Address')}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        data-testid="email-input"
                      />
                    </Stack>

                    <Stack   >
                      <Label htmlFor="password">
                        {getCMSField(cmsData, 'customer-login-passwordLabel', 'Password')}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        data-testid="password-input"
                      />
                    </Stack>

                    {error && (
                      <Stack    align="center">
                        <Text variant="muted" align="center" color="error">
                          {getCMSField(cmsData, 'customer-login-errorIcon', '⚠️')}
                          {' '}
                          {error}
                        </Text>
                      </Stack>
                    )}

                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="lg"
                      disabled={loading}
                      data-testid="signin-button"
                    >
                      {getCMSField(cmsData, 'customer-login-sign_in_button', loading ? '🔄 Signing In...' : '🔐 Sign In')}
                    </Button>

                    <OrDivider>
                      <Text variant="muted">
                        {getCMSField(cmsData, 'customer-login-or_separator', 'or')}
                      </Text>
                    </OrDivider>

                    <Button 
                      type="button"
                      variant="outline" 
                      size="lg"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      data-testid="google-signin-button"
                    >
                      {getCMSField(cmsData, 'customer-login-google_sign_in_button', loading ? '🔄 Connecting...' : 'Sign In with Google')}
                    </Button>
                  </Stack>
                </LoginForm>
              </Stack>
            </LoginCard>

            <LinkText variant="muted">
              {getCMSField(cmsData, 'customer-login-no_account', "Don't have an account?")}
              <Link href="/register">
                {getCMSField(cmsData, 'customer-login-signup_link', 'Sign up')}
              </Link>
            </LinkText>

            <LinkText variant="muted">
              <Link href="/forgot-password">
                {getCMSField(cmsData, 'customer-login-forgot_password', 'Forgot your password?')}
              </Link>
            </LinkText>
          </Stack>
        </Container>
      
    </ToastProvider>
  );
} 