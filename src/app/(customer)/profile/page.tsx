import ProfileClient from './ProfileClient';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'profile' }];
}

// Enable ISR for dynamic content updates
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata() {
  return {
    title: 'Profile - Fairfield Airport Cars',
    description: 'Manage your account information and preferences',
  };
}

export default async function ProfilePage() {
  return <ProfileClient />;
} 