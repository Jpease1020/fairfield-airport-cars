import { cmsFlattenedService } from '@/lib/services/cms-service';
import RegisterPageClient from './RegisterPageClient';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'register' }];
}

// Enable ISR for dynamic content updates
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata() {
  const registerData = await cmsFlattenedService.getPageContent('register');
  
  return {
    title: registerData?.title || 'Register - Fairfield Airport Cars',
    description: registerData?.subtitle || 'Create your account to start booking rides',
  };
}

// Get CMS data at build time
async function getCMSData(): Promise<any> {
  try {
    return await cmsFlattenedService.getPageContent('register');
  } catch (error) {
    console.error('Failed to load CMS data at build time:', error);
    return null;
  }
}

export default async function RegisterPage() {
  const cmsData = await getCMSData();
  
  return <RegisterPageClient cmsData={cmsData} />;
} 