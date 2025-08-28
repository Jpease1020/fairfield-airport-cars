import { cmsFlattenedService } from '@/lib/services/cms-service';
import { CMSConfiguration } from '@/types/cms';
import LoginFormClient from './LoginFormClient';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'login' }];
}

export async function generateMetadata() {
  const loginData = await cmsFlattenedService.getPageContent('login');
  
  return {
    title: loginData?.title || 'Login - Fairfield Airport Cars',
    description: loginData?.subtitle || 'Sign in to your account to manage your bookings',
  };
}

// Get CMS data at build time
async function getCMSData(): Promise<any> {
  try {
    return await cmsFlattenedService.getPageContent('login');
  } catch (error) {
    console.error('Failed to load CMS data at build time:', error);
    return null;
  }
}

export default async function LoginPage() {
  const cmsData = await getCMSData();
  
  return <LoginFormClient cmsData={cmsData} />;
} 