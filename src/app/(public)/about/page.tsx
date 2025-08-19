import React from 'react';
import { Container, Stack } from '@/ui';
import { H1, Text, Button } from '@/design/components/base-components/Components';
import { cmsService } from '@/lib/services/cms-service';
import { CMSConfiguration } from '@/types/cms';
import Link from 'next/link';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'about' }];
}

export async function generateMetadata() {
  const cmsData = await cmsService.getCMSConfiguration();
  const aboutData = cmsData?.pages?.about;
  
  return {
    title: aboutData?.title || 'About Us - Fairfield Airport Cars',
    description: aboutData?.content || 'Learn about Fairfield Airport Car Service - your trusted partner for reliable airport transportation.',
    keywords: 'about, airport transportation, Fairfield, professional drivers, reliable service',
  };
}

// Get CMS data at build time
async function getCMSData(): Promise<CMSConfiguration | null> {
  try {
    return await cmsService.getCMSConfiguration();
  } catch (error) {
    console.error('Failed to load CMS data at build time:', error);
    return null;
  }
}

// Helper function to get field value with fallback
function getCMSField(cmsData: any, fieldPath: string, defaultValue: string = ''): string {
  if (!cmsData) return defaultValue;
  
  const resolvePath = (obj: any, path: string[]): unknown => {
    let cur: any = obj;
    for (const seg of path) {
      if (cur && typeof cur === 'object' && seg in cur) {
        cur = cur[seg as keyof typeof cur];
      } else {
        return undefined;
      }
    }
    return cur;
  };

  const directParts = fieldPath.split('.');
  let value = resolvePath(cmsData, directParts);

  if (value === undefined && directParts[0] !== 'pages') {
    const fallbackParts = ['pages', ...directParts];
    value = resolvePath(cmsData, fallbackParts);
  }

  return typeof value === 'string' ? (value as string) : defaultValue;
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
              data-cms-id="pages.about.title" 
            >
              {getCMSField(cmsData, 'pages.about.title', 'About Us')}
            </H1>
            <Text 
              variant="lead" 
              align="center" 
              size="lg" 
              data-cms-id="pages.about.subtitle" 
            >
              {getCMSField(cmsData, 'pages.about.subtitle', 'Your Trusted Airport Transportation Partner')}
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
            data-cms-id="pages.about.description" 
          >
            {getCMSField(
              cmsData,
              'pages.about.description',
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
            data-cms-id="pages.about.cta.subtitle" 
          >
            {getCMSField(cmsData, 'pages.about.cta.subtitle', 'Ready to experience premium airport transportation?')}
          </Text>
          
          <Stack direction="horizontal" spacing="md" align="center">
            <Link href="/book">
              <Button
                variant="primary"
                data-cms-id="pages.about.cta.primaryButton"
              >
                {getCMSField(cmsData, 'pages.about.cta.primaryButton', 'Book Your Ride')}
              </Button>
            </Link>
            
            <Link href="/help">
              <Button
                variant="secondary"
                data-cms-id="pages.about.cta.secondaryButton"
              >
                {getCMSField(cmsData, 'pages.about.cta.secondaryButton', 'Get Help')}
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