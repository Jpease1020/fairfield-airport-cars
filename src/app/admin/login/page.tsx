'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, signInWithGoogle } from '@/lib/services/auth-service';
import { UnifiedLayout } from '@/components/layout';
import { GridSection, InfoCard, Form, Input, Label, Button, Container, Text, Span, EditableText } from '@/components/ui';
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
      title={<EditableText field="admin.login.title" defaultValue="Admin Login">Admin Login</EditableText>}
      subtitle={<EditableText field="admin.login.subtitle" defaultValue="Enter your credentials to access the admin dashboard">Enter your credentials to access the admin dashboard</EditableText>}
    >
      <GridSection variant="content" columns={1}>
        <InfoCard
          title={<EditableText field="admin.login.authTitle" defaultValue="🔐 Admin Authentication">🔐 Admin Authentication</EditableText>}
          description={<EditableText field="admin.login.authDesc" defaultValue="Sign in to access the admin dashboard">Sign in to access the admin dashboard</EditableText>}
        >
          <Form onSubmit={handleFormSubmit}>
            <Stack spacing="lg">
              <Label htmlFor="email"><EditableText field="admin.login.emailLabel" defaultValue="Email Address">Email Address</EditableText></Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@fairfieldairportcars.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              
              <Label htmlFor="password"><EditableText field="admin.login.passwordLabel" defaultValue="Password">Password</EditableText></Label>
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
                  <EditableText field="admin.login.errorIcon" defaultValue="⚠️">
                    ⚠️
                  </EditableText>
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
                <EditableText field="admin.login.sign_in_button" defaultValue={loading ? '🔄 Signing In...' : '🔐 Sign In'}>
                  {loading ? '🔄 Signing In...' : '🔐 Sign In'}
                </EditableText>
              </Button>
            </Container>
            
            <Container>
              <Span>
                <EditableText field="admin.login.or_separator" defaultValue="or">
                  or
                </EditableText>
              </Span>
            </Container>
            
            <Container>
              <Button 
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                variant="outline"
                size="lg"
              >
                <EditableText field="admin.login.google_sign_in_button" defaultValue={loading ? '🔄 Connecting...' : '🔍 Sign In with Google'}>
                  {loading ? '🔄 Connecting...' : '🔍 Sign In with Google'}
                </EditableText>
              </Button>
            </Container>
          </Form>
        </InfoCard>
      </GridSection>
    </UnifiedLayout>
  );
}
