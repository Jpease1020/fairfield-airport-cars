import { cmsFlattenedService } from '@/lib/services/cms-service';
import ProfileClient from './ProfileClient';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'profile' }];
}

export async function generateMetadata() {
  const profileData = await cmsFlattenedService.getPageContent('profile');
  
  return {
    title: profileData?.title || 'Profile - Fairfield Airport Cars',
    description: profileData?.subtitle || 'Manage your account information and preferences',
  };
}

// Get CMS data at build time
async function getCMSData(): Promise<any> {
  try {
    return await cmsFlattenedService.getPageContent('profile');
  } catch (error) {
    console.error('Failed to load CMS data at build time:', error);
    return null;
  }
}

export default async function ProfilePage() {
  const cmsData = await getCMSData();
  
  return <ProfileClient cmsData={cmsData} />;
} 