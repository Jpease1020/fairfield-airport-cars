'use client';

import React from 'react';
import { Container, Stack, Col, Box } from '@/ui';
import { H1, H2, Text, Button } from '@/ui';
import { HeroCompactBookingForm } from '@/design/components/content-sections/HeroCompactBookingForm';
import { CMSConfiguration } from '@/types/cms';
import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';
import { getCMSField } from '@/design/hooks/useCMSData';

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

const HeroSection = ({ cmsData }: { cmsData: CMSConfiguration | null }) => {
  return (
    <GreyContainer maxWidth="full" padding="xl" variant="section">
      <Stack
        direction={{ xs: 'vertical', lg: 'horizontal' }}
        spacing="xl"
        align="stretch"
      >
        {/* Left Side: Trust Messaging */}
        <FlexStack spacing="xl" justify="center">
          <Stack spacing="md">
            <H1
              align="center"
              data-cms-id="hero-title"
            >
              {getCMSField(cmsData, 'hero-title')}
            </H1>

            <Text
              align="center"
              size="lg"
              data-cms-id="hero-description"
            >
              {getCMSField(cmsData, 'hero-description')}
            </Text>
          </Stack>
        </FlexStack>

        {/* Right Side: Compact Booking Form */}
        <FlexStack justify="center">
          <HeroCompactBookingForm data-testid="hero-booking-form" />
        </FlexStack>
      </Stack>
    </GreyContainer>
  );
}

const FeaturesSection = ({ cmsData }: { cmsData: CMSConfiguration | null }) => {
  return (
    <Stack spacing="xl" align="center">
      <StyledImage
        src="/images/istockphoto-2197504029-1024x1024.jpg"
        alt="Premium airport transportation service"
        width={1024}
        height={1024}
        priority
      />
      
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
        padding="xl"
      >
        <GreyBox variant="elevated" padding="lg">
          <Col grow align="center">
            <Stack spacing="sm" align="center">
              <Text size="xl" align="center">⭐</Text>
              <Text
                align="center"
                variant="lead"
                weight="semibold"
                size="lg"
                data-cms-id="features-items-0-title"
              >
                {getCMSField(cmsData, 'features-items-0-title')}
              </Text>
              <Text
                align="center"
                size="md"
                color="secondary"
                data-cms-id="features-items-0-description"
              >
                {getCMSField(cmsData, 'features-items-0-description')}
              </Text>
            </Stack>
          </Col>
        </GreyBox>
        <GreyBox variant="elevated" padding="lg">
          <Col grow align="center">
            <Stack spacing="md" align="center">
              <Text size="xl" align="center">🚗</Text>
              <Text
                align="center"
                variant="lead"
                weight="semibold"
                size="lg"
                data-cms-id="features-items-1-title"
              >
                {getCMSField(cmsData, 'features-items-1-title')}
              </Text>
              <Text
                align="center"
                size="md"
                color="secondary"
                data-cms-id="features-items-1-description"
              >
                {getCMSField(cmsData, 'features-items-1-description')}
              </Text>
            </Stack>
          </Col>
        </GreyBox>
        <GreyBox variant="elevated" padding="lg">
          <Col grow align="center">
            <Stack spacing="md" align="center">
              <Text size="xl" align="center">💳</Text>
              <Text
                align="center"
                variant="lead"
                weight="semibold"
                size="lg"
                data-cms-id="features-items-2-title"
              >
                {getCMSField(cmsData, 'features-items-2-title')}
              </Text>
              <Text
                align="center"
                size="md"
                color="secondary"
                data-cms-id="features-items-2-description"
              >
                {getCMSField(cmsData, 'features-items-2-description')}
              </Text>
            </Stack>
          </Col>
        </GreyBox>
      </Stack>
    </Stack>
  );
}

const FAQSection = ({ cmsData }: { cmsData: CMSConfiguration | null }) => {
  return (
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

      <GreyBox variant="elevated" padding="xl">
        <Stack spacing="xl" align="stretch">
          <Stack spacing="md">
            <Text
              variant="lead"
              weight="semibold"
              size="lg"
              data-cms-id="faq-items-0-question"
            >
              {getCMSField(cmsData, 'faq-items-0-question')}
            </Text>
            <Text
              size="md"
              color="secondary"
              data-cms-id="faq-items-0-answer"
            >
              {getCMSField(cmsData, 'faq-items-0-answer')}
            </Text>
          </Stack>
          
          <Stack spacing="md">
            <Text
              variant="lead"
              weight="semibold"
              size="lg"
              data-cms-id="faq-items-1-question"
            >
              {getCMSField(cmsData, 'faq-items-1-question')}
            </Text>
            <Text
              size="md"
              color="secondary"
              data-cms-id="faq-items-1-answer"
            >
              {getCMSField(cmsData, 'faq-items-1-answer')}
            </Text>
          </Stack>
          
          <Stack spacing="md">
            <Text
              variant="lead"
              weight="semibold"
              size="lg"
              data-cms-id="faq-items-2-question"
            >
              {getCMSField(cmsData, 'faq-items-2-question')}
            </Text>
            <Text
              size="md"
              color="secondary"
              data-cms-id="faq-items-2-answer"
            >
              {getCMSField(cmsData, 'faq-items-2-answer')}
            </Text>
          </Stack>
        </Stack>
      </GreyBox>
    </Stack>
  );
}

const MobileStickyButton = () => {
  return (
    <StickyButtonContainer>
      <Link href="/book">
        <Button
          variant="primary"
          size="lg"
          data-testid="mobile-sticky-book-now"
        >
          Book Now
        </Button>
      </Link>
    </StickyButtonContainer>
  );
};

const FinalCTASection = ({ cmsData }: { cmsData: CMSConfiguration | null }) => {
  return (
    <Container padding="xl" variant="section">
      <Stack spacing="xl" align="center">
        <Stack spacing="md" align="center">
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
        </Stack>

        <Stack direction="horizontal" spacing="md" align="center" justify="center">
          <Link href="/book">
            <Button
              variant="primary"
              size="lg"
              data-cms-id="final-cta-primary-button"
            >
              {getCMSField(cmsData, 'final-cta-primary-button', 'Book Now')}
            </Button>
          </Link>
          <Link href="/contact">
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
  );
}

const HomePageContent = ({ cmsData }: { cmsData: CMSConfiguration | null }) => {
  return (
    <>
      <HeroSection cmsData={cmsData} data-testid="hero-section"/>
      
      <Container padding="xl" variant="section">
        <H2
          align="center"
          data-cms-id="faq-title"
        >
          {getCMSField(cmsData, 'new-i-haven-tuploaded-subtitle', "No cancellations. No surprises. Just reliable, comfortable airport rides from Fairfield County.")}
        </H2>
        <Stack direction={{ xs: 'vertical', lg: 'horizontal' }} spacing="xl">
          <FeaturesSection cmsData={cmsData} data-testid="features-section" />
          <FAQSection cmsData={cmsData} data-testid="faq-section" />
        </Stack>
      </Container>
      
      <FinalCTASection cmsData={cmsData} data-testid="final-cta-section" />
      
      {/* Mobile Sticky Book Now Button */}
      <MobileStickyButton />
    </>
  );
}

export default HomePageContent;
