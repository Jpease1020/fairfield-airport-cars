'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, signInWithGoogle } from '@/lib/services/auth-service';
import { 
  Container,
  Stack,
  H1,
  H2,
  Text,
  Box,
  Button,
} from '@/ui';
import { Input } from '@/ui';
import { Label } from '@/ui';
import styled from 'styled-components';
import { spacing, colors } from '@/ui';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

// Styled components for login page
const LoginCard = styled(Box)`
  max-width: 500px;
  margin: 0 auto;
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
    background: ${colors.gray[200]};
  }
  
  &::before {
    margin-right: ${spacing.sm};
  }
  
  &::after {
    margin-left: ${spacing.sm};
  }
`;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { cmsData } = useCMSData();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await login(email, password);
      router.push('/admin');
    } catch (error) {
      setError(`Failed to log in: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('handleGoogleSignIn');
    setLoading(true);
    setError(null);
    console.log('Signing in with Google');
    try {
      await signInWithGoogle();
      router.push('/admin');
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
      <Container maxWidth="lg" id="login-section">
        <Stack spacing="2xl" align="center">
          <Stack spacing="lg" align="center">
            <H1 align="center">
              {getCMSField(cmsData, 'admin.login.title', '🔐 Admin Login')}
            </H1>
            <Text variant="lead" align="center">
              {getCMSField(cmsData, 'admin.login.subtitle', 'Enter your credentials to access the admin dashboard')}
            </Text>
          </Stack>
          
          <LoginCard variant="elevated" padding="xl" id="login-card">
            <Stack spacing="lg">
              <H2 align="center" id="login-title">
                {getCMSField(cmsData, 'admin.login.authTitle', 'Admin Authentication')}
              </H2>
              
              <Text align="center" color="secondary">
                {getCMSField(cmsData, 'admin.login.authDesc', 'Sign in to access the admin dashboard')}
              </Text>
              
              <LoginForm onSubmit={handleFormSubmit} id="login-form">
                <Stack spacing="lg">
                  <Stack spacing="sm" align="center">
                    <Label htmlFor="email" id="email-label">
                      {getCMSField(cmsData, 'admin.login.emailLabel', 'Email Address')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@fairfieldairportcars.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      fullWidth
                      data-testid="email-input"
                    />
                  </Stack>
                  
                  <Stack spacing="sm">
                    <Label htmlFor="password" id="password-label">
                      {getCMSField(cmsData, 'admin.login.passwordLabel', 'Password')}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      fullWidth
                      data-testid="password-input"
                    />
                  </Stack>
                  
                  {error && (
                    <Stack direction="horizontal" spacing="sm" align="center">
                      {getCMSField(cmsData, 'admin.login.errorIcon', '⚠️')}
                      <Text color="error" id="error-message">{error}</Text>
                    </Stack>
                  )}
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    variant="primary"
                    size="lg"
                    fullWidth
                    id="sign-in-button"
                    data-testid="sign-in-button"
                  >
                    {getCMSField(cmsData, 'admin.login.sign_in_button', loading ? '🔄 Signing In...' : '🔐 Sign In')}
                  </Button>
                  
                  <OrDivider id="or-divider">
                    <Text size="sm" color="secondary" id="or-text">
                      {getCMSField(cmsData, 'admin.login.or_separator', 'or')}
                    </Text>
                  </OrDivider>
                  
                  <Button 
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    variant="outline"
                    size="lg"
                    fullWidth
                    id="google-sign-in-button"
                    data-testid="google-sign-in-button"
                  >
                      {getCMSField(cmsData, 'admin.login.google_sign_in_button', loading ? '🔄 Connecting...' : 'Sign In with Google')}
                                      </Button>
                </Stack>
              </LoginForm>
            </Stack>
          </LoginCard>
        </Stack>
      </Container>
  );
}
