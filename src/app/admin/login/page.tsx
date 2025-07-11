'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, signInWithGoogle } from '@/lib/auth-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting login with:', email);
    try {
      const result = await login(email, password);
      console.log('Login successful:', result);
      router.push('/admin/bookings');
    } catch (error) {
      console.error('Login error:', error);
      setError(`Failed to log in: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('Attempting Google sign-in');
    try {
      const result = await signInWithGoogle();
      console.log('Google sign-in successful:', result);
      router.push('/admin/bookings');
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(`Failed to sign in with Google: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full">
              Log In
            </Button>
            <p className="text-sm">or</p>
            <Button variant="secondary" className="w-full" onClick={handleGoogleSignIn}>
              Sign In with Google
            </Button>
          </CardFooter>
        </form>
        {error && <p className="text-red-500 text-center pb-4 text-sm">{error}</p>}
      </Card>
    </div>
  );
}
