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
import { getCMSField } from '../../design/hooks/useCMSData';

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

interface LoginFormClientProps {
  cmsData: any;
}

export default function LoginFormClient({ cmsData }: LoginFormClientProps) {
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
                data-cms-id="title"
              >
                {getCMSField(cmsData, 'login-title')}
              </H1>
              <H2 
                align="center" 
                variant="default"
                data-cms-id="subtitle"
              >
                {getCMSField(cmsData, 'login-subtitle')}
              </H2>
            </Stack>
            
            <form onSubmit={handleLogin} id="login-form">
              <Stack spacing="md">
                <div data-cms-id="form-email-label">
                  <Label htmlFor="email">
                    {getCMSField(cmsData, 'login-form-email-label')}
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
                
                <div data-cms-id="form-forgot-password">
                  <Label htmlFor="password">
                    {getCMSField(cmsData, 'login-form-password-label')}
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
                      {getCMSField(cmsData, 'login-error-icon')} {error}
                    </Text>
                  </Box>
                )}
                
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  data-cms-id="sign-in-button"
                >
                  {getCMSField(cmsData, loading ? 'form.signInButtonLoading' : 'form.signInButton')}
                </Button>
              </Stack>
            </form>
            
            <OrDivider>
              <Text variant="small" color="muted">
                {getCMSField(cmsData, 'login-form-or-separator')}
              </Text>
            </OrDivider>
            
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              size="lg"
              disabled={loading}
              data-cms-id="google-sign-in-button"
            >
              {getCMSField(cmsData, loading ? 'form.googleSignInButtonLoading' : 'form.googleSignInButton')}
            </Button>
            
            <LinkText variant="small" color="muted">
              {getCMSField(cmsData, 'login-form-no-account')}{' '}
              <Link href="/register">
                                  {getCMSField(cmsData, 'login-form-signup-link')}
              </Link>
            </LinkText>
            
            <LinkText variant="small" color="muted">
              <Link href="/forgot-password">
                {getCMSField(cmsData, 'login-form-forgot-password')}
              </Link>
            </LinkText>
          </Stack>
        </LoginCard>
      </Container>
    </ToastProvider>
  );
}
