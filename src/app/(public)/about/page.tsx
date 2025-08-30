import React from 'react';
import { Container, Stack } from '@/ui';
import { H1, Text, Button } from '@/design/components/base-components/Components';
import { cmsFlattenedService } from '@/lib/services/cms-service';
import { CMSConfiguration } from '@/types/cms';
import Link from 'next/link';
import { getCMSField } from '../../../design/hooks/useCMSData';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'about' }];
}

export async function generateMetadata() {
  const aboutData = await cmsFlattenedService.getPageContent('about');
  
  return {
    title: aboutData?.title || 'About Us - Fairfield Airport Cars',
    description: aboutData?.content || 'Learn about Fairfield Airport Car Service - your trusted partner for reliable airport transportation.',
    keywords: 'about, airport transportation, Fairfield, professional drivers, reliable service',
  };
}

// Get CMS data at build time
async function getCMSData(): Promise<any> {
  try {
    return await cmsFlattenedService.getPageContent('about');
  } catch (error) {
    console.error('Failed to load CMS data at build time:', error);
    return null;
  }
}

function AboutPageContent({ cmsData }: { cmsData: CMSConfiguration | null }) {
  return (
    <>
      {/* Hero Section */}
      <Container maxWidth="full" padding="xl" variant="section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 
              align="center" 
              data-cms-id="title" 
            >
              {getCMSField(cmsData, 'title', 'About Us')}
            </H1>
            <Text 
              variant="lead" 
              align="center" 
              size="lg" 
              data-cms-id="subtitle" 
            >
              {getCMSField(cmsData, 'subtitle', 'Your Trusted Airport Transportation Partner')}
            </Text>
          </Stack>
        </Stack>
      </Container>

      {/* Main Content Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="lg" align="center">
                      <Text 
              align="center" 
              size="lg" 
              data-cms-id="description" 
            >
              {getCMSField(
                cmsData,
                'description',
                'We are Fairfield Airport Car Service, your trusted partner for reliable and comfortable airport transportation. With years of experience, we understand the importance of punctuality and safety. Our professional drivers are background-checked and equipped with clean, well-maintained vehicles to ensure a smooth and enjoyable journey for you.'
              )}
          </Text>
        </Stack>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="lg" align="center">
                      <Text 
              align="center" 
              data-cms-id="cta-subtitle" 
            >
              {getCMSField(cmsData, 'cta-subtitle', 'Ready to experience premium airport transportation?')}
          </Text>
          
          <Stack direction="horizontal" spacing="md" align="center">
            <Link href="/book">
              <Button
                variant="primary"
                data-cms-id="cta-primary-button"
              >
                {getCMSField(cmsData, 'cta-primary-button', 'Book Your Ride')}
              </Button>
            </Link>
            
            <Link href="/help">
              <Button
                variant="secondary"
                data-cms-id="cta-secondary-button"
              >
                {getCMSField(cmsData, 'cta-secondary-button', 'Get Help')}
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

export default async function AboutPage() {
  // Load CMS data at build time for instant page loads
  const cmsData = await getCMSData();
  
  return <AboutPageContent cmsData={cmsData} />;
} 