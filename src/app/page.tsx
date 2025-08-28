import React from 'react';
import { Container, Stack, Col, Box } from '@/ui';
import { H1, H2, Text, Button } from '@/design/components/base-components/Components';
import { cmsFlattenedService } from '@/lib/services/cms-service';
import { CMSConfiguration } from '@/types/cms';
import Link from 'next/link';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'home' }];
}

export async function generateMetadata() {
  const homeData = await cmsFlattenedService.getPageContent('home');
  
  return {
    title: homeData?.hero?.title || 'Fairfield Airport Cars - Premium Airport Transportation Service',
    description: homeData?.hero?.description || 'Reliable, comfortable rides to and from Fairfield Airport with professional driver',
    keywords: 'airport transportation, Fairfield, JFK, LGA, EWR, airport shuttle, luxury car service',
  };
}

// Get CMS data at build time
async function getCMSData(): Promise<any> {
  try {
    return await cmsFlattenedService.getPageContent('home');
  } catch (error) {
    console.error('Failed to load CMS data at build time:', error);
    return null;
  }
}

// Helper function to get field value from CMS
function getCMSField(cmsData: any, fieldPath: string): string {
  if (!cmsData) return '';
  
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

  // Remove 'pages.' prefix since we're now getting page content directly
  const cleanPath = fieldPath.replace(/^pages\./, '');
  const value = resolvePath(cmsData, cleanPath.split('.'));

  return typeof value === 'string' ? (value as string) : '';
}

function HomePageContent({ cmsData }: { cmsData: CMSConfiguration | null }) {
  return (
    <Container maxWidth="full" padding="none">
      <Container maxWidth="6xl" padding="none" margin="auto">
          {/* Hero Section */}
          <Container maxWidth="full" padding="xl" variant="section">
          <Stack spacing="xl" align="center">
            <Stack spacing="md" align="center">
              <H1 
                align="center" 
                data-cms-id="hero-title" 
              >
                {getCMSField(cmsData, 'hero-title')}
              </H1>
              <Text 
                variant="lead" 
                align="center" 
                size="xl" 
                data-cms-id="hero-subtitle" 
              >
                {getCMSField(cmsData, 'hero-subtitle')}
              </Text>
              <Text 
                align="center" 
                size="lg" 
                data-cms-id="hero-description" 
              >
                {getCMSField(cmsData, 'hero-description')}
              </Text>
              
              <Stack 
                direction={{ xs: 'vertical', md: 'horizontal' }} 
                spacing={{ xs: 'md', md: 'md' }} 
                align="center"
                justify="center"
              >
                <Link href="/book">
                  <Button
                    variant="primary"
                    size="lg"
                    data-cms-id="hero-primary-button"
                  >
                    {getCMSField(cmsData, 'hero-primary-button')}
                  </Button>
                </Link>
                
                <Link href="/about">
                  <Button
                    variant="secondary"
                    size="lg"
                    data-cms-id="hero-secondary-button"
                  >
                    {getCMSField(cmsData, 'hero-secondary-button')}
                  </Button>
                </Link>
              </Stack>
            </Stack>
          </Stack>
        </Container>

        {/* Features Section */}
        <Container maxWidth="6xl" padding="xl">
          <Stack spacing="xl" align="center">
            <Stack spacing="md" align="center">
              <H2 
                align="center" 
                data-cms-id="features-title" 
              >
                {getCMSField(cmsData, 'features-title')}
              </H2>
              <Text 
                align="center" 
                size="lg" 
                data-cms-id="features-subtitle" 
              >
                {getCMSField(cmsData, 'features-subtitle')}
              </Text>
            </Stack>
            
            <Stack 
              direction={{ xs: 'vertical', md: 'horizontal' }} 
              spacing={{ xs: 'lg', md: 'xl' }} 
              align="stretch"
            >
            <Box variant="elevated" padding="lg">
              <Col grow align="center" padding="md">
                <Stack spacing="md" align="center">
                  <Text size="xl" align="center">⭐</Text>
                  <Text 
                    align="center" 
                    variant="lead" 
                    data-cms-id="features-items-0-title" 
                  >
                    {getCMSField(cmsData, 'features-items-0-title')}
                  </Text>
                  <Text 
                    align="center" 
                    data-cms-id="features-items-0-description" 
                  >
                    {getCMSField(cmsData, 'features-items-0-description')}
                  </Text>
                </Stack>
              </Col>
            </Box>
            <Box variant="elevated" padding="lg">

            <Col grow align="center" padding="md">
              <Stack spacing="md" align="center">
                <Text size="xl" align="center">🚗</Text>
                <Text 
                  align="center" 
                  variant="lead" 
                  data-cms-id="features-items-1-title" 
                >
                  {getCMSField(cmsData, 'features-items-1-title')}
                </Text>
                <Text 
                  align="center" 
                  data-cms-id="features-items-1-description" 
                >
                  {getCMSField(cmsData, 'features-items-1-description')}
                </Text>
              </Stack>
            </Col>
            </Box>
            <Box variant="elevated" padding="lg">
            <Col grow align="center" padding="md">
              <Stack spacing="md" align="center">
                <Text size="xl" align="center">💳</Text>
                <Text 
                  align="center" 
                  variant="lead" 
                  data-cms-id="features-items-2-title" 
                >
                  {getCMSField(cmsData, 'features-items-2-title')}
                </Text>
                <Text 
                  align="center" 
                  data-cms-id="features-items-2-description" 
                >
                  {getCMSField(cmsData, 'features-items-2-description')}
                </Text>
              </Stack>
            </Col>
            </Box>
          </Stack>
        </Stack>
      </Container>

      {/* About Section */}
      <Container maxWidth="6xl" padding="xl">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
                          <H2 
                align="center" 
                data-cms-id="about-title" 
              >
                {getCMSField(cmsData, 'about-title')}
              </H2>
              <Text 
                align="center" 
                size="lg" 
                data-cms-id="about-content" 
              >
                {getCMSField(cmsData, 'about-content')}
              </Text>
          </Stack>
        </Stack>
      </Container>

      {/* FAQ Section */}
        <Container maxWidth="6xl" padding="xl">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
                          <H2 
                align="center" 
                data-cms-id="faq-title" 
              >
                {getCMSField(cmsData, 'faq-title')}
              </H2>
              <Text 
                align="center" 
                size="lg" 
                data-cms-id="faq-subtitle" 
              >
                {getCMSField(cmsData, 'faq-subtitle')}
              </Text>
          </Stack>
          
          <Box variant="elevated" padding="lg">
          <Stack spacing="lg" align="stretch">
            <Stack spacing="md" align="stretch">
                            <Text 
                variant="lead" 
                weight="semibold"
                data-cms-id="faq-items-0-question" 
              >
                {getCMSField(cmsData, 'faq-items-0-question')}
              </Text>
              <Text 
                data-cms-id="faq-items-0-answer" 
              >
                {getCMSField(cmsData, 'faq-items-0-answer')}
              </Text>
            </Stack>
            
                        <Stack spacing="md" align="stretch">
              <Text 
                variant="lead" 
                weight="semibold"
                data-cms-id="faq-items-1-question" 
              >
                {getCMSField(cmsData, 'faq-items-1-question')}
              </Text>
              <Text 
                data-cms-id="faq-items-1-answer" 
              >
                {getCMSField(cmsData, 'faq-items-1-answer')}
              </Text>
            </Stack>
            
            <Stack spacing="md" align="center">
              <Text 
                variant="lead" 
                weight="semibold"
                                  data-cms-id="faq-items-2-question" 
              >
                                  {getCMSField(cmsData, 'faq-items-2-question')}
              </Text>
              <Text 
                                  data-cms-id="faq-items-2-answer" 
              >
                                  {getCMSField(cmsData, 'faq-items-2-answer')}
              </Text>
            </Stack>
            
            <Stack spacing="md" align="center">
              <Text 
                variant="lead" 
                weight="semibold"
                                  data-cms-id="faq-items-3-question" 
              >
                                  {getCMSField(cmsData, 'faq-items-3-question')}
              </Text>
              <Text 
                                  data-cms-id="faq-items-3-answer" 
              >
                                  {getCMSField(cmsData, 'faq-items-3-answer')}
              </Text>
            </Stack>
          </Stack>
          </Box>
        </Stack>
        
      </Container>

        {/* Final CTA Section */}
        <Container maxWidth="6xl" padding="xl"> 
          <Stack spacing="lg" align="center">
            <H2 
              align="center" 
              data-cms-id="final-cta-title" 
            >
              {getCMSField(cmsData, 'final-cta-title')}
            </H2>
            <Text 
              align="center" 
              size="lg" 
              data-cms-id="final-cta-description" 
            >
              {getCMSField(cmsData, 'final-cta-description')}
            </Text>
            
            <Stack 
              direction={{ xs: 'vertical', md: 'horizontal' }} 
              spacing={{ xs: 'md', md: 'md' }} 
              align="center"
              justify="center"
            >
              <Link href="/book">
                <Button
                  variant="primary"
                  size="lg"
                  data-cms-id="final-cta-button-text"
                >
                  {getCMSField(cmsData, 'final-cta-button-text')}
                </Button>
              </Link>
              
              <Link href="/about">
                <Button
                  variant="secondary"
                  size="lg"
                  data-cms-id="final-cta-secondary-button"
                >
                  {getCMSField(cmsData, 'final-cta-secondary-button')}
                </Button>
              </Link>
            </Stack>
          </Stack>
        </Container>
        
        {/* CMS editing handled globally by AppContent */}
      </Container>
    </Container>
  );
}

export default async function HomePage() {
  // Load CMS data at build time for instant page loads
  const cmsData = await getCMSData();
  
  return <HomePageContent cmsData={cmsData} />;
} 