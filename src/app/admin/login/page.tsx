'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, signInWithGoogle } from '@/lib/services/auth-service';
import { UnifiedLayout } from '@/components/layout';
import { GridSection, InfoCard, Form, Input, Label, Button, Container, Text, Span } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

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
    setLoading(true);
    setError(null);
    
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
    <UnifiedLayout
      layoutType="standard"
      title="Admin Login"
      subtitle="Enter your credentials to access the admin dashboard"
    >
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="🔐 Admin Authentication"
          description="Sign in to access the admin dashboard"
        >
          <Form onSubmit={handleFormSubmit}>
            <Stack spacing="lg">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@fairfieldairportcars.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              
              {error && (
                <Stack direction="horizontal" spacing="sm" align="center">
                  <Text>⚠️</Text>
                  <Text color="error">{error}</Text>
                </Stack>
              )}
            </Stack>
            
            <Container>
              <Button 
                type="submit" 
                disabled={loading}
                variant="primary"
                size="lg"
              >
                {loading ? '🔄 Signing In...' : '🔐 Sign In'}
              </Button>
              
              <Container>
                <Span>or</Span>
              </Container>
              
              <Button 
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                variant="outline"
                size="lg"
              >
                {loading ? '🔄 Connecting...' : '🔍 Sign In with Google'}
              </Button>
            </Container>
          </Form>
        </InfoCard>
      </GridSection>
    </UnifiedLayout>
  );
}
