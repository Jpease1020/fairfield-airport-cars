'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createCustomerAccount, signInWithGoogle } from '@/lib/services/auth-service';
import { 
  Section,
  Container,
  Stack,
  H1,
  H2,
  Text,
  Card,
  Form,
  Button,
  ToastProvider
} from '@/components/ui';
import { Input } from '@/design/components/core/layout/FormSystem';
import { Label } from '@/design/components/core/layout/label';
import { EditableText } from '@/design/components/core/layout/EditableSystem';
import styled from 'styled-components';
import { spacing, fontSize, fontWeight } from '../../../design/design-system/tokens';

// Styled components for registration page
const RegisterCard = styled(Card)`
  max-width: 500px;
  margin: 0 auto;
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
    background: var(--border-color, #e5e7eb);
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
    color: var(--primary-color, #3b82f6);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

export default function CustomerRegisterPage() {
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
      router.push('/dashboard');
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
      router.push('/dashboard');
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
      <Section variant="brand" padding="xl" id="register-section">
        <Container>
          <Stack gap="xl" align="center">
            <Stack gap="sm" align="center">
              <H1 align="center">
                <EditableText field="customer.register.title" defaultValue="Create Your Account">
                  Create Your Account
                </EditableText>
              </H1>
              <Text align="center" variant="muted">
                <EditableText field="customer.register.subtitle" defaultValue="Sign up to start booking your airport rides">
                  Sign up to start booking your airport rides
                </EditableText>
              </Text>
            </Stack>

            <RegisterCard variant="elevated" padding="xl" id="register-card">
              <Stack gap="lg">
                <Stack gap="sm" align="center">
                  <H2 align="center" id="register-title">
                    <EditableText field="customer.register.authTitle" defaultValue="Customer Registration">
                      Customer Registration
                    </EditableText>
                  </H2>
                  <Text align="center" variant="muted">
                    <EditableText field="customer.register.authDesc" defaultValue="Create your account to manage bookings">
                      Create your account to manage bookings
                    </EditableText>
                  </Text>
                </Stack>

                <RegisterForm onSubmit={handleFormSubmit} id="register-form">
                  <Stack gap="md">
                    <Stack gap="sm">
                      <Label htmlFor="name">
                        <EditableText field="customer.register.nameLabel" defaultValue="Full Name">
                          Full Name
                        </EditableText>
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

                    <Stack gap="sm">
                      <Label htmlFor="email">
                        <EditableText field="customer.register.emailLabel" defaultValue="Email Address">
                          Email Address
                        </EditableText>
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

                    <Stack gap="sm">
                      <Label htmlFor="phone">
                        <EditableText field="customer.register.phoneLabel" defaultValue="Phone Number">
                          Phone Number
                        </EditableText>
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

                    <Stack gap="sm">
                      <Label htmlFor="password">
                        <EditableText field="customer.register.passwordLabel" defaultValue="Password">
                          Password
                        </EditableText>
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

                    <Stack gap="sm">
                      <Label htmlFor="confirmPassword">
                        <EditableText field="customer.register.confirmPasswordLabel" defaultValue="Confirm Password">
                          Confirm Password
                        </EditableText>
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
                      <Stack gap="sm" align="center">
                        <Text variant="muted" align="center" style={{ color: 'var(--error-color, #ef4444)' }}>
                          <EditableText field="customer.register.errorIcon" defaultValue="⚠️">
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
                      data-testid="register-button"
                    >
                      <EditableText field="customer.register.sign_up_button" defaultValue={loading ? '🔄 Creating Account...' : '📝 Create Account'}>
                        {loading ? '🔄 Creating Account...' : '📝 Create Account'}
                      </EditableText>
                    </Button>

                    <OrDivider>
                      <Text variant="muted">
                        <EditableText field="customer.register.or_separator" defaultValue="or">
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
                      <EditableText field="customer.register.google_sign_in_button" defaultValue={loading ? '🔄 Connecting...' : 'Sign Up with Google'}>
                        {loading ? '🔄 Connecting...' : 'Sign Up with Google'}
                      </EditableText>
                    </Button>
                  </Stack>
                </RegisterForm>
              </Stack>
            </RegisterCard>

            <LinkText variant="muted">
              <EditableText field="customer.register.have_account" defaultValue="Already have an account?">
                Already have an account?{' '}
              </EditableText>
              <Link href="/login">
                <EditableText field="customer.register.signin_link" defaultValue="Sign in">
                  Sign in
                </EditableText>
              </Link>
            </LinkText>
          </Stack>
        </Container>
      </Section>
    </ToastProvider>
  );
} 