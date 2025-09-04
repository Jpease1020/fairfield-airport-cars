import LoginFormClient from './LoginFormClient';

export async function generateMetadata() {
  return {
    title: 'Login - Fairfield Airport Cars',
    description: 'Sign in to your account to manage your bookings',
  };
}

export default function LoginPage() {
  return <LoginFormClient />;
} 