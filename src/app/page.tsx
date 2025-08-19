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
    <>
      {/* Hero Section */}
      <Container maxWidth="full" padding="xl" variant="section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 
              align="center" 
              data-cms-id="pages.home.hero.title" 
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.home.hero.title', 'Professional Airport Transportation')}
            </H1>
            <Text 
              variant="lead" 
              align="center" 
              size="xl" 
              data-cms-id="pages.home.hero.subtitle" 
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.home.hero.subtitle', 'Reliable rides to and from Fairfield County airports')}
            </Text>
            <Text 
              align="center" 
              size="lg" 
              data-cms-id="pages.home.hero.description" 
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.home.hero.description', 'Professional driver, clean vehicle, on-time service. Book your airport ride with confidence.')}
            </Text>
            
            <Stack direction="horizontal" spacing="md" align="center">
              <Button
                variant="primary"
                size="lg"
                data-cms-id="pages.home.hero.primaryButton"
                interactionMode={mode}
                onClick={() => router.push('/book')}
              >
                {getCMSField(cmsData, 'pages.home.hero.primaryButton', 'Book Now')}
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                data-cms-id="pages.home.hero.secondaryButton"
                interactionMode={mode}
                onClick={() => router.push('/about')}
              >
                {getCMSField(cmsData, 'pages.home.hero.secondaryButton', 'Learn More')}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Container>

      {/* Features Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H2 
              align="center" 
              data-cms-id="pages.home.features.title" 
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.home.features.title', 'Why Choose Us')}
            </H2>
            <Text 
              align="center" 
              size="lg" 
              data-cms-id="pages.home.features.subtitle" 
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.home.features.subtitle', 'Professional service you can count on')}
            </Text>
          </Stack>
          
          <Stack direction="horizontal" spacing="xl" align="stretch">
          <Box variant="elevated" padding="lg">
            <Col grow align="center" padding="md">
              <Stack spacing="md" align="center">
                <Text size="xl" align="center">⏰</Text>
                <Text 
                  align="center" 
                  variant="lead" 
                  data-cms-id="pages.home.features.items.0.title" 
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.home.features.items.0.title', 'On-Time Service')}
                </Text>
                <Text 
                  align="center" 
                  data-cms-id="pages.home.features.items.0.description" 
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.home.features.items.0.description', 'Reliable pickup times with flight tracking and real-time updates')}
                </Text>
              </Stack>
            </Col>
            </Box>
            <Box variant="elevated" padding="lg">

            <Col grow align="center" padding="md">
              <Stack spacing="md" align="center">
                <Text size="xl" align="center">🚙</Text>
                <Text 
                  align="center" 
                  variant="lead" 
                  data-cms-id="pages.home.features.items.1.title" 
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.home.features.items.1.title', 'Clean Vehicle')}
                </Text>
                <Text 
                  align="center" 
                  data-cms-id="pages.home.features.items.1.description" 
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.home.features.items.1.description', 'Well-maintained, professional vehicle with luxury options')}
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
                  {getCMSField(cmsData, 'pages.home.features.items.2.title', 'Easy Booking')}
                </Text>
                <Text 
                  align="center" 
                  data-cms-id="pages.home.features.items.2.description" 
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.home.features.items.2.description', 'Secure online booking and payment with instant confirmation')}
                </Text>
              </Stack>
            </Col>
            </Box>
          </Stack>
        </Stack>
      </Container>

      {/* Vehicle Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H2 
              align="center" 
              data-cms-id="pages.home.vehicle.title" 
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.home.vehicle.title', 'Our Vehicle')}
            </H2>
            <Text 
              align="center" 
              size="lg" 
              data-cms-id="pages.home.vehicle.description" 
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.home.vehicle.description', 'You will ride in a meticulously maintained Chevrolet Suburban, offering ample space for passengers and luggage with premium amenities including complimentary water, Wi-Fi, and phone chargers.')}
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
                  {getCMSField(cmsData, 'pages.home.vehicle.features.title', 'Luxury SUV Service')}
                </Text>
                <Text 
                  align="center" 
                  data-cms-id="pages.home.vehicle.features.description" 
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.home.vehicle.features.description', 'Professional driver with background checks, ensuring your safety and comfort throughout your journey.')}
                </Text>
              </Stack>
            </Col>
          </Box>
        </Stack>
      </Container>

      {/* Testimonials Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H2 
              align="center" 
              data-cms-id="pages.home.testimonials.title" 
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.home.testimonials.title', 'What Our Customers Say')}
            </H2>
            <Text 
              align="center" 
              size="lg" 
              data-cms-id="pages.home.testimonials.subtitle" 
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.home.testimonials.subtitle', 'Real feedback from satisfied customers')}
            </Text>
          </Stack>
          
          <Stack direction="horizontal" spacing="xl" align="stretch">
            <Col grow align="center" padding="md">
              <Stack spacing="md" align="center">
                <Text 
                  align="center" 
                  data-cms-id="pages.home.testimonials.items.0.content" 
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.home.testimonials.items.0.content', 'Fairfield Airport Cars made my business trips stress-free. Always on time and professional service.')}
                </Text>
                <Stack spacing="xs" align="center">
                  <Text 
                    align="center" 
                    variant="lead" 
                    data-cms-id="pages.home.testimonials.items.0.name" 
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.home.testimonials.items.0.name', 'Sarah Johnson')}
                  </Text>
                  <Text 
                    align="center" 
                    size="sm" 
                    data-cms-id="pages.home.testimonials.items.0.role" 
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.home.testimonials.items.0.role', 'Business Traveler')}
                  </Text>
                  <Text 
                    align="center" 
                    size="sm" 
                    data-cms-id="pages.home.testimonials.items.0.company" 
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.home.testimonials.items.0.company', 'Tech Corp')}
                  </Text>
                </Stack>
              </Stack>
            </Col>
            
            <Col grow align="center" padding="md">
              <Stack spacing="md" align="center">
                <Text 
                  align="center" 
                  data-cms-id="pages.home.testimonials.items.1.content" 
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.home.testimonials.items.1.content', 'The best airport transportation service I\'ve used. Clean cars and friendly drivers.')}
                </Text>
                <Stack spacing="xs" align="center">
                  <Text 
                    align="center" 
                    variant="lead" 
                    data-cms-id="pages.home.testimonials.items.1.name" 
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.home.testimonials.items.1.name', 'Mike Chen')}
                  </Text>
                  <Text 
                    align="center" 
                    size="sm" 
                    data-cms-id="pages.home.testimonials.items.1.role" 
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.home.testimonials.items.1.role', 'Frequent Flyer')}
                  </Text>
                </Stack>
              </Stack>
            </Col>
            
            <Col grow align="center" padding="md">
              <Stack spacing="md" align="center">
                <Text 
                  align="center" 
                  data-cms-id="pages.home.testimonials.items.2.content" 
                  mode={mode}
                >
                  {getCMSField(cmsData, 'pages.home.testimonials.items.2.content', 'I recommend Fairfield Airport Cars to all my clients. Reliable and professional.')}
                </Text>
                <Stack spacing="xs" align="center">
                  <Text 
                    align="center" 
                    variant="lead" 
                    data-cms-id="pages.home.testimonials.items.2.name" 
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.home.testimonials.items.2.name', 'Lisa Rodriguez')}
                  </Text>
                  <Text 
                    align="center" 
                    size="sm" 
                    data-cms-id="pages.home.testimonials.items.2.role" 
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.home.testimonials.items.2.role', 'Travel Consultant')}
                  </Text>
                </Stack>
              </Stack>
            </Col>
          </Stack>
        </Stack>
      </Container>

      {/* FAQ Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H2 
              align="center" 
              data-cms-id="pages.home.faq.title" 
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.home.faq.title', 'Frequently Asked Questions')}
            </H2>
            <Text 
              align="center" 
              size="lg" 
              data-cms-id="pages.home.faq.subtitle" 
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.home.faq.subtitle', 'Everything you need to know about our service')}
            </Text>
          </Stack>
          
          <Stack spacing="lg" align="stretch">
            <Stack spacing="md" align="stretch">
              <Text 
                variant="lead" 
                weight="semibold"
                                  data-cms-id="pages.home.faq.items.0.question" 
                mode={mode}
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.0.question', 'Which airports do you serve?')}
              </Text>
              <Text 
                                  data-cms-id="pages.home.faq.items.0.answer" 
                mode={mode}
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.0.answer', 'We provide service to and from all major airports in the New York and Connecticut area, including JFK, LaGuardia (LGA), Newark (EWR), Westchester (HPN), and Bradley (BDL).')}
              </Text>
            </Stack>
            
            <Stack spacing="md" align="stretch">
              <Text 
                variant="lead" 
                weight="semibold"
                                  data-cms-id="pages.home.faq.items.1.question" 
                mode={mode}
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.1.question', 'How far in advance should I book my ride?')}
              </Text>
              <Text 
                                  data-cms-id="pages.home.faq.items.1.answer" 
                mode={mode}
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.1.answer', 'We recommend booking at least 24 hours in advance to ensure availability. However, we will always do our best to accommodate last-minute requests.')}
              </Text>
            </Stack>
            
            <Stack spacing="md" align="stretch">
              <Text 
                variant="lead" 
                weight="semibold"
                                  data-cms-id="pages.home.faq.items.2.question" 
                mode={mode}
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.2.question', 'What is your cancellation policy?')}
              </Text>
              <Text 
                                  data-cms-id="pages.home.faq.items.2.answer" 
                mode={mode}
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.2.answer', 'You can cancel for a full refund up to 12 hours before your scheduled pickup time. Cancellations within 12 hours of pickup are non-refundable.')}
              </Text>
            </Stack>
            
            <Stack spacing="md" align="stretch">
              <Text 
                variant="lead" 
                weight="semibold"
                                  data-cms-id="pages.home.faq.items.3.question" 
                mode={mode}
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.3.question', 'What kind of vehicle will I be riding in?')}
              </Text>
              <Text 
                                  data-cms-id="pages.home.faq.items.3.answer" 
                mode={mode}
              >
                                  {getCMSField(cmsData, 'pages.home.faq.items.3.answer', 'You will be riding in a modern, clean, and comfortable black SUV, typically a Chevrolet Suburban or similar, equipped with complimentary water, Wi-Fi, and phone chargers.')}
              </Text>
            </Stack>
          </Stack>
        </Stack>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="lg" align="center">
          <H2 
            align="center" 
            data-cms-id="pages.home.cta.title" 
            mode={mode}
          >
            {getCMSField(cmsData, 'pages.home.cta.title', 'Ready to Book Your Ride?')}
          </H2>
          <Text 
            align="center" 
            size="lg" 
            data-cms-id="pages.home.cta.subtitle" 
            mode={mode}
          >
            {getCMSField(cmsData, 'pages.home.cta.subtitle', 'Professional airport transportation at your service')}
          </Text>
          
          <Stack direction="horizontal" spacing="md" align="center">
            <Button
              variant="primary"
              size="lg"
              data-cms-id="pages.home.cta.primaryButton"
              interactionMode={mode}
              onClick={() => router.push('/book')}
            >
              {getCMSField(cmsData, 'pages.home.cta.primaryButton', 'Book Now')}
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              data-cms-id="pages.home.cta.secondaryButton"
              interactionMode={mode}
              onClick={() => router.push('/about')}
            >
              {getCMSField(cmsData, 'pages.home.cta.secondaryButton', 'Learn More')}
            </Button>
          </Stack>
        </Stack>
      </Container>
      
      {/* CMS editing handled globally by AppContent */}
    </>
  );
}

export default function HomePage() {
  return (
    <HomePageContent />
  );
} 