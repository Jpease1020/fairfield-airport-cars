"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Container, Stack, Col, Box } from '@/ui';
import { H1, H2, Text, Button } from '@/design/components/base-components/Components';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';


function HomePageContent() {
  const router = useRouter();
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
  
  // Debug: Log the CMS data structure
  console.log('Home page CMS data:', cmsData);
  
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
                mode={mode}
              >
                {getCMSField(cmsData, 'pages.home.hero.title')}
              </H1>
              <Text 
                variant="lead" 
                align="center" 
                size="xl" 
                data-cms-id="pages.home.hero.subtitle" 
                mode={mode}
              >
                {getCMSField(cmsData, 'pages.home.hero.subtitle')}
              </Text>
              <Text 
                align="center" 
                size="lg" 
                data-cms-id="pages.home.hero.description" 
                mode={mode}
              >
                {getCMSField(cmsData, 'pages.home.hero.description')}
              </Text>
              
              <Stack 
                direction={{ xs: 'vertical', md: 'horizontal' }} 
                spacing={{ xs: 'md', md: 'md' }} 
                align="center"
                justify="center"
              >
                <Button
                  variant="primary"
                  size="lg"
                  data-cms-id="pages.home.hero.primaryButton"
                  interactionMode={mode}
                  onClick={() => router.push('/book')}
                >
                  {getCMSField(cmsData, 'pages.home.hero.primaryButton')}
                </Button>
                
                <Button
                  variant="secondary"
                  size="lg"
                  data-cms-id="pages.home.hero.secondaryButton"
                  interactionMode={mode}
                  onClick={() => router.push('/about')}
                >
                  {getCMSField(cmsData, 'pages.home.hero.secondaryButton')}
                </Button>
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
                mode={mode}
              >
                {getCMSField(cmsData, 'pages.home.features.title')}
              </H2>
              <Text 
                align="center" 
                size="lg" 
                data-cms-id="pages.home.features.subtitle" 
                mode={mode}
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
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.home.features.items.0.title')}
                  </Text>
                  <Text 
                    align="center" 
                    data-cms-id="pages.home.features.items.0.description" 
                    mode={mode}
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
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.home.features.items.1.title')}
                </Text>
                <Text 
                  align="center" 
                  data-cms-id="pages.home.features.items.1.description" 
                  mode={mode}
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
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.home.features.items.2.title')}
                </Text>
                <Text 
                  align="center" 
                  data-cms-id="pages.home.features.items.2.description" 
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.home.features.items.2.description')}
                </Text>
              </Stack>
            </Col>
            </Box>
          </Stack>
        </Stack>
      </Container>

      {/* Vehicle Section */}
      <Container maxWidth="6xl" padding="xl">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H2 
              align="center" 
              data-cms-id="pages.home.vehicle.title" 
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.home.vehicle.title')}
            </H2>
            <Text 
              align="center" 
              size="lg" 
              data-cms-id="pages.home.vehicle.description" 
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.home.vehicle.description')}
            </Text>
          </Stack>
          
          <Box variant="elevated" padding="lg">
            <Col grow align="center" padding="md">
              <Stack spacing="md" align="center">
                <Text 
                  align="center" 
                  variant="lead" 
                  data-cms-id="pages.home.vehicle.features.title" 
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.home.vehicle.features.title')}
                </Text>
                <Text 
                  align="center" 
                  data-cms-id="pages.home.vehicle.features.description" 
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.home.vehicle.features.description')}
                </Text>
              </Stack>
            </Col>
          </Box>
        </Stack>
      </Container>

      {/* Testimonials Section */}
      <Container maxWidth="6xl" padding="xl">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H2 
              align="center" 
              data-cms-id="pages.home.testimonials.title" 
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.home.testimonials.title')}
            </H2>
            <Text 
              align="center" 
              size="lg" 
              data-cms-id="pages.home.testimonials.subtitle" 
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.home.testimonials.subtitle')}
            </Text>
          </Stack>
          
          <Stack 
            direction={{ xs: 'vertical', md: 'horizontal' }} 
            spacing={{ xs: 'lg', md: 'xl' }} 
            align="stretch"
          >
            <Col grow align="center" padding="md">
            <Box variant="elevated" padding="lg">
              <Stack spacing="md" align="center">
                <Text 
                  align="center" 
                  data-cms-id="pages.home.testimonials.items.0.content" 
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.home.testimonials.items.0.content')}
                </Text>
                <Stack spacing="xs" align="center">
                  <Text 
                    align="center" 
                    variant="lead" 
                    data-cms-id="pages.home.testimonials.items.0.name" 
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.home.testimonials.items.0.name')}
                  </Text>
                  <Text 
                    align="center" 
                    size="sm" 
                    data-cms-id="pages.home.testimonials.items.0.role" 
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.home.testimonials.items.0.role')}
                  </Text>
                  <Text 
                    align="center" 
                    size="sm" 
                    data-cms-id="pages.home.testimonials.items.0.company" 
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.home.testimonials.items.0.company')}
                  </Text>                  
                </Stack>
              </Stack>
            </Box>
            </Col>
            
            <Col grow align="center" padding="md">
            <Box variant="elevated" padding="lg">
              <Stack spacing="md" align="center">
                <Text 
                  align="center" 
                  data-cms-id="pages.home.testimonials.items.1.content" 
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.home.testimonials.items.1.content', 'The best airport transportation service I\'ve used. Clean vehicle and friendly driver.')}
                </Text>
                <Stack spacing="xs" align="center">
                  <Text 
                    align="center" 
                    variant="lead" 
                    data-cms-id="pages.home.testimonials.items.1.name" 
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.home.testimonials.items.1.name')}
                  </Text>
                  <Text 
                    align="center" 
                    size="sm" 
                    data-cms-id="pages.home.testimonials.items.1.role" 
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.home.testimonials.items.1.role')}
                  </Text>
                </Stack>
              </Stack>
              </Box>
            </Col>
            
            <Box variant="elevated" padding="lg">
            <Col grow align="center" padding="md">
              <Stack spacing="md" align="center">
                <Text 
                  align="center" 
                  data-cms-id="pages.home.testimonials.items.2.content" 
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.home.testimonials.items.2.content')}
                </Text>
                <Stack spacing="xs" align="center">
                  <Text 
                    align="center" 
                    variant="lead" 
                    data-cms-id="pages.home.testimonials.items.2.name" 
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.home.testimonials.items.2.name')}
                  </Text>
                  <Text 
                    align="center" 
                    size="sm" 
                    data-cms-id="pages.home.testimonials.items.2.role" 
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.home.testimonials.items.2.role')}
                  </Text>
                </Stack>
              </Stack>
              
            </Col>
            </Box>
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
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.home.faq.title')}
            </H2>
            <Text 
              align="center" 
              size="lg" 
              data-cms-id="pages.home.faq.subtitle" 
              mode={mode}
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
                mode={mode}
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.0.question')}
              </Text>
              <Text 
                                  data-cms-id="pages.home.faq.items.0.answer" 
                mode={mode}
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.0.answer')}
              </Text>
            </Stack>
            
            <Stack spacing="md" align="stretch">
              <Text 
                variant="lead" 
                weight="semibold"
                                  data-cms-id="pages.home.faq.items.1.question" 
                mode={mode}
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.1.question')}
              </Text>
              <Text 
                                  data-cms-id="pages.home.faq.items.1.answer" 
                mode={mode}
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.1.answer')}
              </Text>
            </Stack>
            
            <Stack spacing="md" align="center">
              <Text 
                variant="lead" 
                weight="semibold"
                                  data-cms-id="pages.home.faq.items.2.question" 
                mode={mode}
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.2.question')}
              </Text>
              <Text 
                                  data-cms-id="pages.home.faq.items.2.answer" 
                mode={mode}
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.2.answer')}
              </Text>
            </Stack>
            
            <Stack spacing="md" align="center">
              <Text 
                variant="lead" 
                weight="semibold"
                                  data-cms-id="pages.home.faq.items.3.question" 
                mode={mode}
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.3.question')}
              </Text>
              <Text 
                                  data-cms-id="pages.home.faq.items.3.answer" 
                mode={mode}
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.3.answer')}
              </Text>
            </Stack>
          </Stack>
          </Box>
        </Stack>
        
      </Container>

        {/* CTA Section */}
        <Container maxWidth="6xl" padding="xl"> 
          <Stack spacing="lg" align="center">
            <H2 
              align="center" 
              data-cms-id="pages.home.cta.title" 
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.home.cta.title')}
            </H2>
            <Text 
              align="center" 
              size="lg" 
              data-cms-id="pages.home.cta.subtitle" 
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.home.cta.subtitle')}
            </Text>
            
            <Stack 
              direction={{ xs: 'vertical', md: 'horizontal' }} 
              spacing={{ xs: 'md', md: 'md' }} 
              align="center"
              justify="center"
            >
              <Button
                variant="primary"
                size="lg"
                data-cms-id="pages.home.cta.primaryButton"
                interactionMode={mode}
                onClick={() => router.push('/book')}
              >
                {getCMSField(cmsData, 'pages.home.cta.primaryButton')}
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                data-cms-id="pages.home.cta.secondaryButton"
                interactionMode={mode}
                onClick={() => router.push('/about')}
              >
                {getCMSField(cmsData, 'pages.home.cta.secondaryButton')}
              </Button>
            </Stack>
          </Stack>
        </Container>
        
        {/* CMS editing handled globally by AppContent */}
      </Container>
    </Container>
  );
}

export default function HomePage() {
  return (
    <HomePageContent />
  );
} 