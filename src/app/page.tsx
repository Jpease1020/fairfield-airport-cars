import React from 'react';
import { Container, Stack, Col, Box } from '@/ui';
import { H1, H2, Text, Button } from '@/design/components/base-components/Components';
import { cmsService } from '@/lib/services/cms-service';
import { CMSConfiguration } from '@/types/cms';
import Link from 'next/link';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'home' }];
}

export async function generateMetadata() {
  const cmsData = await cmsService.getCMSConfiguration();
  const homeData = cmsData?.pages?.home;
  
  return {
    title: homeData?.hero?.title || 'Fairfield Airport Cars - Premium Airport Transportation Service',
    description: homeData?.hero?.description || 'Reliable, comfortable rides to and from Fairfield Airport with professional driver',
    keywords: 'airport transportation, Fairfield, JFK, LGA, EWR, airport shuttle, luxury car service',
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

  const directParts = fieldPath.split('.');
  let value = resolvePath(cmsData, directParts);

  if (value === undefined && directParts[0] !== 'pages') {
    const fallbackParts = ['pages', ...directParts];
    value = resolvePath(cmsData, fallbackParts);
  }

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
                data-cms-id="pages.home.hero.title" 
              >
                {getCMSField(cmsData, 'pages.home.hero.title')}
              </H1>
              <Text 
                variant="lead" 
                align="center" 
                size="xl" 
                data-cms-id="pages.home.hero.subtitle" 
              >
                {getCMSField(cmsData, 'pages.home.hero.subtitle')}
              </Text>
              <Text 
                align="center" 
                size="lg" 
                data-cms-id="pages.home.hero.description" 
              >
                {getCMSField(cmsData, 'pages.home.hero.description')}
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
                    data-cms-id="pages.home.hero.primaryButton"
                  >
                    {getCMSField(cmsData, 'pages.home.hero.primaryButton')}
                  </Button>
                </Link>
                
                <Link href="/about">
                  <Button
                    variant="secondary"
                    size="lg"
                    data-cms-id="pages.home.hero.secondaryButton"
                  >
                    {getCMSField(cmsData, 'pages.home.hero.secondaryButton')}
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
                data-cms-id="pages.home.features.title" 
              >
                {getCMSField(cmsData, 'pages.home.features.title')}
              </H2>
              <Text 
                align="center" 
                size="lg" 
                data-cms-id="pages.home.features.subtitle" 
              >
                {getCMSField(cmsData, 'pages.home.features.subtitle')}
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
                    data-cms-id="pages.home.features.items.0.title" 
                  >
                    {getCMSField(cmsData, 'pages.home.features.items.0.title')}
                  </Text>
                  <Text 
                    align="center" 
                    data-cms-id="pages.home.features.items.0.description" 
                  >
                    {getCMSField(cmsData, 'pages.home.features.items.0.description')}
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
                  data-cms-id="pages.home.features.items.1.title" 
                >
                  {getCMSField(cmsData, 'pages.home.features.items.1.title')}
                </Text>
                <Text 
                  align="center" 
                  data-cms-id="pages.home.features.items.1.description" 
                >
                  {getCMSField(cmsData, 'pages.home.features.items.1.description')}
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
                  data-cms-id="pages.home.features.items.2.title" 
                >
                  {getCMSField(cmsData, 'pages.home.features.items.2.title')}
                </Text>
                <Text 
                  align="center" 
                  data-cms-id="pages.home.features.items.2.description" 
                >
                  {getCMSField(cmsData, 'pages.home.features.items.2.description', 'We pride ourselves on punctuality, ensuring you\'re never late.')}
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
              data-cms-id="pages.home.about.title" 
            >
              {getCMSField(cmsData, 'pages.home.about.title')}
            </H2>
            <Text 
              align="center" 
              size="lg" 
              data-cms-id="pages.home.about.content" 
            >
              {getCMSField(cmsData, 'pages.home.about.content')}
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
              data-cms-id="pages.home.faq.title" 
            >
              {getCMSField(cmsData, 'pages.home.faq.title')}
            </H2>
            <Text 
              align="center" 
              size="lg" 
              data-cms-id="pages.home.faq.subtitle" 
            >
              {getCMSField(cmsData, 'pages.home.faq.subtitle')}
            </Text>
          </Stack>
          
          <Box variant="elevated" padding="lg">
          <Stack spacing="lg" align="stretch">
            <Stack spacing="md" align="stretch">
              <Text 
                variant="lead" 
                weight="semibold"
                                  data-cms-id="pages.home.faq.items.0.question" 
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.0.question')}
              </Text>
              <Text 
                                  data-cms-id="pages.home.faq.items.0.answer" 
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.0.answer')}
              </Text>
            </Stack>
            
            <Stack spacing="md" align="stretch">
              <Text 
                variant="lead" 
                weight="semibold"
                                  data-cms-id="pages.home.faq.items.1.question" 
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.1.question')}
              </Text>
              <Text 
                                  data-cms-id="pages.home.faq.items.1.answer" 
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.1.answer')}
              </Text>
            </Stack>
            
            <Stack spacing="md" align="center">
              <Text 
                variant="lead" 
                weight="semibold"
                                  data-cms-id="pages.home.faq.items.2.question" 
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.2.question')}
              </Text>
              <Text 
                                  data-cms-id="pages.home.faq.items.2.answer" 
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.2.answer')}
              </Text>
            </Stack>
            
            <Stack spacing="md" align="center">
              <Text 
                variant="lead" 
                weight="semibold"
                                  data-cms-id="pages.home.faq.items.3.question" 
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.3.question')}
              </Text>
              <Text 
                                  data-cms-id="pages.home.faq.items.3.answer" 
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.3.answer')}
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
              data-cms-id="pages.home.finalCta.title" 
            >
              {getCMSField(cmsData, 'pages.home.finalCta.title')}
            </H2>
            <Text 
              align="center" 
              size="lg" 
              data-cms-id="pages.home.finalCta.description" 
            >
              {getCMSField(cmsData, 'pages.home.finalCta.description')}
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
                  data-cms-id="pages.home.finalCta.buttonText"
                >
                  {getCMSField(cmsData, 'pages.home.finalCta.buttonText')}
                </Button>
              </Link>
              
              <Link href="/about">
                <Button
                  variant="secondary"
                  size="lg"
                  data-cms-id="pages.home.finalCta.secondaryButton"
                >
                  {getCMSField(cmsData, 'pages.home.finalCta.secondaryButton')}
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