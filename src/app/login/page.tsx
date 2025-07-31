'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, signInWithGoogle } from '@/lib/services/auth-service';
import { 
  Section,
  Container,
  Stack,
  H1,
  H2,
  Text,
  ContentBox,
  Form,
  Button,
  ToastProvider
} from '@/ui';
import { Input } from '@/ui';
import { Label } from '@/ui';
import { EditableText } from '@/ui';
import styled from 'styled-components';
import { spacing, fontSize, fontWeight } from '@/design/system/tokens/tokens';

// Styled components for login page
const LoginCard = styled(ContentBox)`
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
  text-align: center;
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
      router.push('/dashboard');
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
      router.push('/dashboard');
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
      <Section variant="brand" padding="xl" id="login-section">
        <Container>
          <Stack   align="center">
            <Stack    align="center">
              <H1 align="center">
                <EditableText field="customer.login.title" defaultValue="Welcome Back">
                  Welcome Back
                </EditableText>
              </H1>
              <Text align="center" variant="muted">
                <EditableText field="customer.login.subtitle" defaultValue="Sign in to your account to manage your bookings">
                  Sign in to your account to manage your bookings
                </EditableText>
              </Text>
            </Stack>

            <LoginCard variant="elevated" padding="xl" id="login-card">
              <Stack>
                <Stack    align="center">
                  <H2 align="center" id="login-title">
                    <EditableText field="customer.login.authTitle" defaultValue="Customer Login">
                      Customer Login
                    </EditableText>
                  </H2>
                  <Text align="center" variant="muted">
                    <EditableText field="customer.login.authDesc" defaultValue="Sign in to access your account">
                      Sign in to access your account
                    </EditableText>
                  </Text>
                </Stack>

                <LoginForm onSubmit={handleFormSubmit} id="login-form">
                  <Stack>
                    <Stack   >
                      <Label htmlFor="email">
                        <EditableText field="customer.login.emailLabel" defaultValue="Email Address">
                          Email Address
                        </EditableText>
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
                        <EditableText field="customer.login.passwordLabel" defaultValue="Password">
                          Password
                        </EditableText>
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
                          <EditableText field="customer.login.errorIcon" defaultValue="⚠️">
                            ⚠️
                          </EditableText>
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
                      <EditableText field="customer.login.sign_in_button" defaultValue={loading ? '🔄 Signing In...' : '🔐 Sign In'}>
                        {loading ? '🔄 Signing In...' : '🔐 Sign In'}
                      </EditableText>
                    </Button>

                    <OrDivider>
                      <Text variant="muted">
                        <EditableText field="customer.login.or_separator" defaultValue="or">
                          or
                        </EditableText>
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
                      <EditableText field="customer.login.google_sign_in_button" defaultValue={loading ? '🔄 Connecting...' : 'Sign In with Google'}>
                        {loading ? '🔄 Connecting...' : 'Sign In with Google'}
                      </EditableText>
                    </Button>
                  </Stack>
                </LoginForm>
              </Stack>
            </LoginCard>

            <LinkText variant="muted">
              <EditableText field="customer.login.no_account" defaultValue="Don't have an account?">
                Don't have an account?{' '}
              </EditableText>
              <Link href="/register">
                <EditableText field="customer.login.signup_link" defaultValue="Sign up">
                  Sign up
                </EditableText>
              </Link>
            </LinkText>

            <LinkText variant="muted">
              <Link href="/forgot-password">
                <EditableText field="customer.login.forgot_password" defaultValue="Forgot your password?">
                  Forgot your password?
                </EditableText>
              </Link>
            </LinkText>
          </Stack>
        </Container>
      </Section>
    </ToastProvider>
  );
} 