'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/services/auth-service';
import { 
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
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

export default function ForgotPasswordPage() {
  const { cmsData } = useCMSData();
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
        
          <Container id="forgot-password-section">
            <Stack align="center">
              <Stack align="center">
                <H1 align="center">
                  {getCMSField(cmsData, 'customer.forgot_password.success_title', 'Check Your Email')}
                </H1>
                <Text align="center" variant="muted">
                  {getCMSField(cmsData, 'customer.forgot_password.success_message', 'We\'ve sent a password reset link to your email address.')}
                </Text>
              </Stack>

              <Box variant="elevated" padding="xl">
                <Stack align="center">
                  <Text align="center" variant="muted">
                    {getCMSField(cmsData, 'customer.forgot_password.check_email', 'Please check your email and click the link to reset your password.')}
                  </Text>
                  
                  <Text variant="muted" align="center" marginTop="md">
                    <Link href="/login">
                      {getCMSField(cmsData, 'customer.forgot_password.back_to_login', 'Back to Login')}
                    </Link>
                  </Text>
                </Stack>
              </Box>
            </Stack>
          </Container>
        
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      
        <Container id="forgot-password-section">
          <Stack   align="center">
            <Stack    align="center">
              <H1 align="center">
                {getCMSField(cmsData, 'customer.forgot_password.title', 'Forgot Your Password?')}
              </H1>
              <Text align="center" variant="muted">
                {getCMSField(cmsData, 'customer.forgot_password.subtitle', 'Enter your email address and we\'ll send you a link to reset your password')}
              </Text>
            </Stack>

            <Box variant="elevated" padding="xl" id="forgot-password-card">
              <Stack>
                <Stack    align="center">
                  <H2 align="center" id="forgot-password-title">
                    {getCMSField(cmsData, 'customer.forgot_password.authTitle', 'Reset Password')}
                  </H2>
                  <Text align="center" variant="muted">
                    {getCMSField(cmsData, 'customer.forgot_password.authDesc', 'Enter your email to receive reset instructions')}
                  </Text>
                </Stack>

                <Form onSubmit={handleSubmit} id="forgot-password-form" fullWidth>
                  <Stack>
                    <Stack   >
                      <Label htmlFor="email">
                        {getCMSField(cmsData, 'customer.forgot_password.emailLabel', 'Email Address')}
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
                            {getCMSField(cmsData, 'customer.forgot_password.errorIcon', '⚠️')}
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
                      {getCMSField(cmsData, 'customer.forgot_password.reset_button', loading ? '🔄 Sending...' : '📧 Send Reset Link')}
                    </Button>
                  </Stack>
                </Form>
              </Stack>
            </Box>

            <Text variant="muted" align="center" marginTop="md">
              <Link href="/login">
                {getCMSField(cmsData, 'customer.forgot_password.back_to_login', 'Back to Login')}
              </Link>
            </Text>
          </Stack>
        </Container>
      
    </ToastProvider>
  );
} 