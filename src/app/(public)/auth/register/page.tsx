import RegisterPageClient from './RegisterPageClient';

export async function generateMetadata() {
  return {
    title: 'Register - Fairfield Airport Cars',
    description: 'Create your account to start booking rides',
  };
}

export default function RegisterPage() {
  return <RegisterPageClient />;
} 