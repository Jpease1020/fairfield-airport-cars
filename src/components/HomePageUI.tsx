'use client';

import React from 'react';
import { Container, Stack, Col, Box } from '@/ui';
import { H1, H2, Text, Button } from '@/ui';
import { HeroCompactBookingForm } from '@/design/components/content-sections/HeroCompactBookingForm';
import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';
import { useCMSData } from '@/design/providers/CMSDataProvider';

// Styled components
const StyledImage = styled(Image)`
  width: 100%;
  height: auto;
  max-width: 600px;
  border-radius: 8px;
`;

const FlexStack = styled(Stack)`
  flex: 1;
`;

const GreyBox = styled(Box)`
  background-color: var(--background-muted);
  height: 100%;
`;

const GreyContainer = styled(Container)`
  background-color: var(--background-muted);
`;

const StickyButtonContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 1rem;
  z-index: 1000;
  
  /* Hide on desktop */
  @media (min-width: 768px) {
    display: none;
  }
`;

const HeroSection = ({ cmsData }: { cmsData: any | null }) => {
  return (
    <GreyContainer maxWidth="full" padding="xl" variant="section" data-testid="hero-section">
      <Stack
        direction={{ xs: 'vertical', lg: 'horizontal' }}
        spacing="xl"
        align="stretch"
      >
        {/* Left Side: Trust Messaging */}
        <FlexStack spacing="xl" justify="center" data-testid="hero-trust-messaging">
          <Stack spacing="md">
            <H1
              align="center"
              cmsId="hero-title"
              data-testid="hero-title"
            >
              {cmsData?.['hero-title'] || 'Premium Airport Transportation'}
            </H1>

            <Text
              align="center"
              size="lg"
              cmsId="hero-description"
              data-testid="hero-description"
            >
              {cmsData?.['hero-description'] || "No cancellations. No surprises. Just reliable, comfortable airport rides from Fairfield County."}
            </Text>
          </Stack>
        </FlexStack>

        {/* Right Side: Compact Booking Form */}
        <FlexStack justify="center" data-testid="hero-booking-form-container">
          <HeroCompactBookingForm data-testid="hero-booking-form" />
        </FlexStack>
      </Stack>
    </GreyContainer>
  );
}

const FeaturesSection = ({ cmsData }: { cmsData: any | null }) => {
  return (
    <Stack spacing="xl" align="center" data-testid="features-section">
      <StyledImage
        src="/images/bram-van-oost-eaPkue76Ip4-unsplash.jpg"
        alt="Premium airport transportation service"
        width={1024}
        height={1024}
        priority
        data-testid="features-hero-image"
      />
      
      <Stack spacing="md" align="center">
        <H2
          align="center"
          cmsId="features-title"
          data-testid="features-title"
        >
          {cmsData?.['features-title'] || 'Why Choose Us'}
        </H2>
        <Text
          align="center"
          size="lg"
          cmsId="features-subtitle"
          data-testid="features-subtitle"
        >
          {cmsData?.['features-subtitle'] || 'Experience the difference with our premium service'}
        </Text>
      </Stack>

      <Stack
        direction={{ xs: 'vertical', md: 'horizontal' }}
        spacing={{ xs: 'lg', md: 'xl' }}
        align="stretch"
        padding="xl"
      >
        <GreyBox variant="elevated" padding="lg" data-testid="feature-box-1">
          <Col grow align="center">
            <Stack spacing="sm" align="center">
              <Text size="xl" align="center" cmsId="ignore">⭐</Text>
              <Text
                align="center"
                variant="lead"
                weight="semibold"
                size="lg"
                cmsId="features-items-0-title"
              >
                {cmsData?.['features-items-0-title'] || 'Reliable Service'}
              </Text>
              <Text
                align="center"
                size="md"
                color="secondary"
                cmsId="features-items-0-description"
              >
                {cmsData?.['features-items-0-description'] || 'Professional drivers and well-maintained vehicles'}
              </Text>
            </Stack>
          </Col>
        </GreyBox>
        <GreyBox variant="elevated" padding="lg" data-testid="feature-box-2">
          <Col grow align="center">
            <Stack spacing="md" align="center">
              <Text size="xl" align="center" cmsId="ignore">🚗</Text>
              <Text
                align="center"
                variant="lead"
                weight="semibold"
                size="lg"
                cmsId="features-items-1-title"
              >
                {cmsData?.['features-items-1-title'] || 'Flight Tracking'}
              </Text>
              <Text
                align="center"
                size="md"
                color="secondary"
                cmsId="features-items-1-description"
              >
                {cmsData?.['features-items-1-description'] || 'We monitor your flight for delays and adjust pickup times'}
              </Text>
            </Stack>
          </Col>
        </GreyBox>
        <GreyBox variant="elevated" padding="lg" data-testid="feature-box-3">
          <Col grow align="center">
            <Stack spacing="md" align="center">
              <Text size="xl" align="center" cmsId="ignore">💳</Text>
              <Text
                align="center"
                variant="lead"
                weight="semibold"
                size="lg"
                cmsId="features-items-2-title"
              >
                {cmsData?.['features-items-2-title'] || '24/7 Support'}
              </Text>
              <Text
                align="center"
                size="md"
                color="secondary"
                cmsId="features-items-2-description"
              >
                {cmsData?.['features-items-2-description'] || 'Round-the-clock customer service and emergency support'}
              </Text>
            </Stack>
          </Col>
        </GreyBox>
      </Stack>
    </Stack>
  );
}

const FAQSection = ({ cmsData }: { cmsData: any | null }) => {
  return (
    <Stack spacing="xl" align="center" data-testid="faq-section">
      <Stack spacing="md" align="center">
        <H2
          align="center"
          cmsId="faq-title"
          data-testid="faq-title"
        >
          {cmsData?.['faq-title'] || 'Frequently Asked Questions'}
        </H2>
        <Text
          align="center"
          size="lg"
          cmsId="faq-subtitle"
          data-testid="faq-subtitle"
        >
          {cmsData?.['faq-subtitle'] || 'Everything you need to know about our service'}
        </Text>
      </Stack>

      <GreyBox variant="elevated" padding="xl" data-testid="faq-container">
        <Stack spacing="xl" align="stretch">
          <Stack spacing="md" data-testid="faq-item-1">
            <Text
              variant="lead"
              weight="semibold"
              size="lg"
              cmsId="faq-items-0-question"
            >
              {cmsData?.['faq-items-0-question'] || 'How far in advance should I book?'}
            </Text>
            <Text
              size="md"
              color="secondary"
              cmsId="faq-items-0-answer"
            >
              {cmsData?.['faq-items-0-answer'] || 'We recommend booking at least 24 hours in advance for the best availability.'}
            </Text>
          </Stack>
          
          <Stack spacing="md" data-testid="faq-item-2">
            <Text
              variant="lead"
              weight="semibold"
              size="lg"
              cmsId="faq-items-1-question"
            >
              {cmsData?.['faq-items-1-question'] || 'What if my flight is delayed?'}
            </Text>
            <Text
              size="md"
              color="secondary"
              cmsId="faq-items-1-answer"
            >
              {cmsData?.['faq-items-1-answer'] || 'We track your flight and automatically adjust pickup times for delays.'}
            </Text>
          </Stack>
          
          <Stack spacing="md" data-testid="faq-item-3">
            <Text
              variant="lead"
              weight="semibold"
              size="lg"
              cmsId="faq-items-2-question"
            >
              {cmsData?.['faq-items-2-question'] || 'Can I cancel or modify my booking?'}
            </Text>
            <Text
              size="md"
              color="secondary"
              cmsId="faq-items-2-answer"
            >
              {cmsData?.['faq-items-2-answer'] || 'Yes, you can modify or cancel your booking up to 3 hours before pickup.'}
            </Text>
          </Stack>
        </Stack>
      </GreyBox>
    </Stack>
  );
}

const MobileStickyButton = ({ cmsData }: { cmsData: any | null }) => {
  return (
    <StickyButtonContainer>
      <Link href="/book">
        <Button
          variant="primary"
          size="lg"
          data-testid="mobile-sticky-book-now"
          cmsId="mobile-sticky-book-now"
          
          text={cmsData?.['mobile-sticky-book-now'] || 'Book Now'}
        />
      </Link>
    </StickyButtonContainer>
  );
};

const FinalCTASection = ({ cmsData }: { cmsData: any | null }) => {
  return (
    <Container padding="xl" variant="section" data-testid="final-cta-section">
      <Stack spacing="xl" align="center">
        <Stack spacing="md" align="center">
          <H2
            align="center"
            cmsId="final-cta-title"
            data-testid="final-cta-title"
          >
            {cmsData?.['final-cta-title'] || 'Ready to Book Your Ride?'}
          </H2>
          <Text
            align="center"
            size="lg"
            cmsId="final-cta-description"
            data-testid="final-cta-description"
          >
            {cmsData?.['final-cta-description'] || 'Experience reliable airport transportation with Fairfield Airport Cars'}
          </Text>
        </Stack>

        <Stack direction="horizontal" spacing="md" align="center" justify="center">
          <Link href="/book">
            <Button
              variant="primary"
              size="lg"
              cmsId="final-cta-primary-button"
              data-testid="final-cta-primary-button"
            >
              {cmsData?.['final-cta-primary-button'] || 'Book Now'}
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              variant="secondary"
              size="lg"
              cmsId="final-cta-secondary-button"
              data-testid="final-cta-secondary-button"
            >
              {cmsData?.['final-cta-secondary-button'] || 'Learn More'}
            </Button>
          </Link>
        </Stack>
      </Stack>
    </Container>
  );
}

const HomePageContent = () => {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const pageCmsData = allCmsData?.home || null;
  return (
    <>
      <HeroSection cmsData={pageCmsData} data-testid="hero-section"/>
      
      <Container padding="xl" variant="section" data-testid="main-content-section">
        {/* <H2
          align="center"
          cmsId="faq-title"
          data-testid="main-subtitle"
        >
          {pageCmsData?.['new-i-haven-tuploaded-subtitle'] || "No cancellations. No surprises. Just reliable, comfortable airport rides from Fairfield County."}
        </H2> */}
        <Stack direction={{ xs: 'vertical', lg: 'horizontal' }} spacing="xl">
          <FeaturesSection cmsData={pageCmsData} data-testid="features-section" />
          <FAQSection cmsData={pageCmsData} data-testid="faq-section" />
        </Stack>
      </Container>
      
      <FinalCTASection cmsData={pageCmsData} data-testid="final-cta-section" />
      
      {/* Mobile Sticky Book Now Button */}
      <MobileStickyButton cmsData={pageCmsData} />
    </>
  );
}

export default HomePageContent;
