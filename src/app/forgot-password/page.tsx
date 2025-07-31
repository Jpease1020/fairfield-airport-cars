'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/services/auth-service';
import { 
  Section,
  Container,
  Stack,
  H1,
  H2,
  Text,
  Box,
  Form,
  Button,
  ToastProvider
} from '@/ui';
import { Input } from '@/ui';
import { Label } from '@/ui';
import { EditableText } from '@/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      setError(`Failed to send reset email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <ToastProvider>
        <Section variant="brand" padding="xl" id="forgot-password-section">
          <Container>
            <Stack   align="center">
              <Stack    align="center">
                <H1 align="center">
                  <EditableText field="customer.forgot_password.success_title" defaultValue="Check Your Email">
                    Check Your Email
                  </EditableText>
                </H1>
                <Text align="center" variant="muted">
                  <EditableText field="customer.forgot_password.success_message" defaultValue="We've sent a password reset link to your email address.">
                    We've sent a password reset link to your email address.
                  </EditableText>
                </Text>
              </Stack>

              <Box variant="elevated" padding="xl">
                <Stack align="center">
                  <Text align="center" variant="muted">
                    <EditableText field="customer.forgot_password.check_email" defaultValue="Please check your email and click the link to reset your password.">
                      Please check your email and click the link to reset your password.
                    </EditableText>
                  </Text>
                  
                  <Text variant="muted" align="center" marginTop="md">
                    <Link href="/login">
                      <EditableText field="customer.forgot_password.back_to_login" defaultValue="Back to Login">
                        Back to Login
                      </EditableText>
                    </Link>
                  </Text>
                </Stack>
              </Box>
            </Stack>
          </Container>
        </Section>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <Section variant="brand" padding="xl" id="forgot-password-section">
        <Container>
          <Stack   align="center">
            <Stack    align="center">
              <H1 align="center">
                <EditableText field="customer.forgot_password.title" defaultValue="Forgot Your Password?">
                  Forgot Your Password?
                </EditableText>
              </H1>
              <Text align="center" variant="muted">
                <EditableText field="customer.forgot_password.subtitle" defaultValue="Enter your email address and we'll send you a link to reset your password">
                  Enter your email address and we'll send you a link to reset your password
                </EditableText>
              </Text>
            </Stack>

            <Box variant="elevated" padding="xl" id="forgot-password-card">
              <Stack>
                <Stack    align="center">
                  <H2 align="center" id="forgot-password-title">
                    <EditableText field="customer.forgot_password.authTitle" defaultValue="Reset Password">
                      Reset Password
                    </EditableText>
                  </H2>
                  <Text align="center" variant="muted">
                    <EditableText field="customer.forgot_password.authDesc" defaultValue="Enter your email to receive reset instructions">
                      Enter your email to receive reset instructions
                    </EditableText>
                  </Text>
                </Stack>

                <Form onSubmit={handleSubmit} id="forgot-password-form" fullWidth>
                  <Stack>
                    <Stack   >
                      <Label htmlFor="email">
                        <EditableText field="customer.forgot_password.emailLabel" defaultValue="Email Address">
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

                    {error && (
                      <Stack    align="center">
                        <Text color="error" align="center">
                          <EditableText field="customer.forgot_password.errorIcon" defaultValue="⚠️">
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
                      data-testid="reset-password-button"
                    >
                      <EditableText field="customer.forgot_password.reset_button" defaultValue={loading ? '🔄 Sending...' : '📧 Send Reset Link'}>
                        {loading ? '🔄 Sending...' : '📧 Send Reset Link'}
                      </EditableText>
                    </Button>
                  </Stack>
                </Form>
              </Stack>
            </Box>

            <Text variant="muted" align="center" marginTop="md">
              <Link href="/login">
                <EditableText field="customer.forgot_password.back_to_login" defaultValue="Back to Login">
                  Back to Login
                </EditableText>
              </Link>
            </Text>
          </Stack>
        </Container>
      </Section>
    </ToastProvider>
  );
} 