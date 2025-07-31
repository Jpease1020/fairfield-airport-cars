'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, signInWithGoogle } from '@/lib/services/auth-service';
import { 
  Section,
  Container,
  Stack,
  H1,
  H2,
  Text,
  Card,
  Button,
} from '@/ui';
import { Input } from '@/ui';
import { Label } from '@/ui';
import { EditableText } from '@/ui';
import styled from 'styled-components';
import { spacing, fontSize, fontWeight } from '@/design/design-system/tokens';

// Styled components for login page
const LoginCard = styled(Card)`
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
    background: var(--border-color, #e5e7eb);
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
    <Section variant="brand" padding="xl" id="login-section">
      <Container maxWidth="lg">
        <Stack spacing="2xl" align="center" gap="md">
          <Stack spacing="lg" align="center">
            <H1 align="center">
              <EditableText field="admin.login.title" defaultValue="🔐 Admin Login">
                🔐 Admin Login
              </EditableText>
            </H1>
            <Text variant="lead" align="center">
              <EditableText field="admin.login.subtitle" defaultValue="Enter your credentials to access the admin dashboard">
                Enter your credentials to access the admin dashboard
              </EditableText>
            </Text>
          </Stack>
          
          <LoginCard variant="elevated" padding="xl" id="login-card">
            <Stack spacing="lg">
              <H2 align="center" id="login-title">
                <EditableText field="admin.login.authTitle" defaultValue="Admin Authentication">
                  Admin Authentication
                </EditableText>
              </H2>
              
              <Text align="center" color="secondary">
                <EditableText field="admin.login.authDesc" defaultValue="Sign in to access the admin dashboard">
                  Sign in to access the admin dashboard
                </EditableText>
              </Text>
              
              <LoginForm onSubmit={handleFormSubmit} id="login-form">
                <Stack spacing="lg" gap="lg" fullWidth>
                  <Stack spacing="sm" gap="sm" fullWidth align="center">
                    <Label htmlFor="email" id="email-label">
                      <EditableText field="admin.login.emailLabel" defaultValue="Email Address">
                        Email Address
                      </EditableText>
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
                  
                  <Stack spacing="sm" gap="sm" fullWidth>
                    <Label htmlFor="password" id="password-label">
                      <EditableText field="admin.login.passwordLabel" defaultValue="Password">
                        Password
                      </EditableText>
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
                    <Stack direction="horizontal" spacing="sm" gap="sm" align="center" fullWidth>
                      <EditableText field="admin.login.errorIcon" defaultValue="⚠️">
                        ⚠️
                      </EditableText>
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
                    <EditableText field="admin.login.sign_in_button" defaultValue={loading ? '🔄 Signing In...' : '🔐 Sign In'}>
                      {loading ? '🔄 Signing In...' : '🔐 Sign In'}
                    </EditableText>
                  </Button>
                  
                  <OrDivider id="or-divider">
                    <Text size="sm" color="secondary" id="or-text">
                      <EditableText field="admin.login.or_separator" defaultValue="or">
                        or
                      </EditableText>
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
                      <EditableText field="admin.login.google_sign_in_button" defaultValue={loading ? '🔄 Connecting...' : 'Sign In with Google'}>
                        {loading ? '🔄 Connecting...' : 'Sign In with Google'}
                      </EditableText>
                                      </Button>
                </Stack>
              </LoginForm>
            </Stack>
          </LoginCard>
        </Stack>
      </Container>
    </Section>
  );
}
