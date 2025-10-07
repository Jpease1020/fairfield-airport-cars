'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createCustomerAccount, signInWithGoogle, authService } from '@/lib/services/auth-service';
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
} from '@/design/ui';
import styled from 'styled-components';
import { useCMSData } from '@/design/providers/CMSDataProvider';

// Styled components for registration page
const RegisterCard = styled(Box)`
  max-width: 500px;
  display: flex;
  justify-content: center;
  transition: transform 0.2s ease-in-out;
  width: 100%;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const RegisterForm = styled.form`
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

export default function RegisterPageClient() {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const pageCmsData = allCmsData?.register || {};
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    
    try {
      await createCustomerAccount(
        formData.email,
        formData.password,
        formData.name,
        formData.phone
      );
      {
        const current = auth.currentUser;
        if (current && await authService.isAdmin(current.uid)) {
          router.push('/admin');
        } else {
          router.push('/portal');
        }
      }
    } catch (error) {
      setError(`Failed to create account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
      {
        const current = auth.currentUser;
        if (current && await authService.isAdmin(current.uid)) {
          router.push('/admin');
        } else {
          router.push('/portal');
        }
      }
    } catch (error) {
      setError(`Failed to sign in with Google: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRegister(e);
  };

  return (
    <ToastProvider>
      <Container id="register-section">
        <Stack align="center">
          <Stack align="center">
            <H1 align="center">
              {pageCmsData?.['customer-register-title'] || 'Create Your Account'}
            </H1>
            <Text align="center" variant="muted">
              {pageCmsData?.['customer-register-subtitle'] || 'Sign up to start booking your airport rides'}
            </Text>
          </Stack>

          <RegisterCard variant="elevated" padding="xl" id="register-card">
            <Stack>
              <Stack align="center">
                <H2 align="center" id="register-title">
                  {pageCmsData?.['customer-register-authTitle'] || 'Customer Registration'}
                </H2>
                <Text align="center" variant="muted">
                  {pageCmsData?.['customer-register-authDesc'] || 'Create your account to manage bookings'}
                </Text>
              </Stack>

              <RegisterForm onSubmit={handleFormSubmit} id="register-form">
                <Stack>
                  <Stack>
                    <Label htmlFor="name">
                      {pageCmsData?.['customer-register-nameLabel'] || 'Full Name'}
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                      data-testid="name-input"
                    />
                  </Stack>

                  <Stack>
                    <Label htmlFor="email">
                      {pageCmsData?.['customer-register-emailLabel'] || 'Email Address'}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                      required
                      data-testid="email-input"
                    />
                  </Stack>

                  <Stack>
                    <Label htmlFor="phone">
                      {pageCmsData?.['customer-register-phoneLabel'] || 'Phone Number'}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      required
                      data-testid="phone-input"
                    />
                  </Stack>

                  <Stack>
                    <Label htmlFor="password">
                      {pageCmsData?.['customer-register-passwordLabel'] || 'Password'}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
                      placeholder="Create a password"
                      required
                      data-testid="password-input"
                    />
                  </Stack>

                  <Stack>
                    <Label htmlFor="confirmPassword">
                      {pageCmsData?.['customer-register-confirmPasswordLabel'] || 'Confirm Password'}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      required
                      data-testid="confirm-password-input"
                    />
                  </Stack>

                  {error && (
                    <Stack align="center">
                      <Text variant="muted" align="center" color="error">
                        {pageCmsData?.['customer-register-errorIcon'] || '⚠️'}
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
                    data-testid="register-button"
                    cmsId="register-button"
                    
                    text={pageCmsData?.['customer-register-sign_up_button'] || (loading ? '🔄 Creating Account...' : '📝 Create Account')}
                  />

                  <OrDivider>
                    <Text variant="muted">
                      {pageCmsData?.['customer-register-or_separator'] || 'or'}
                    </Text>
                  </OrDivider>

                  <Button 
                    type="button"
                    variant="outline" 
                    size="lg"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    data-testid="google-signin-button"
                    cmsId="google-signin-button"
                    
                    text={pageCmsData?.['customer-register-google_sign_in_button'] || (loading ? '🔄 Connecting...' : 'Sign Up with Google')}
                  />
                </Stack>
              </RegisterForm>
            </Stack>
          </RegisterCard>

          <LinkText variant="muted">
            {pageCmsData?.['customer-register-have_account'] || 'Already have an account?'}
            <Link href="/auth/login">
              {pageCmsData?.['customer-register-signin_link'] || 'Sign in'}
            </Link>
          </LinkText>
        </Stack>
      </Container>
    </ToastProvider>
  );
}
