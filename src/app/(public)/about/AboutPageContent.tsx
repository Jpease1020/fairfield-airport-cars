'use client';

import React from 'react';
import styled from 'styled-components';
import { Container, Stack, Box } from '@/design/ui';
import { H1, H2, Text, Button } from '@/design/components/base-components/Components';
import { useCMSData } from '@/design/providers/CMSDataProvider';
import Link from 'next/link';
import Image from 'next/image';
import { colors } from '@/design/system/tokens/tokens';

const DarkerGreyBox = styled(Box)`
  background-color: ${colors.gray[100]};
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  aspect-ratio: 16 / 10;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 auto;

  img {
    object-fit: cover;
  }
`;

const ValueItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const ValueIcon = styled.span`
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
`;

export default function AboutPageContent() {
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.about || {};

  return (
    <>
      {/* Hero Section */}
      <Container maxWidth="full" padding="xl" variant="section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 align="center">
              {cmsData?.['title'] || 'Meet Your Driver'}
            </H1>
            <Text variant="lead" align="center" size="lg">
              {cmsData?.['subtitle'] || 'One driver. One promise. Always on time.'}
            </Text>
          </Stack>
        </Stack>
      </Container>

      {/* Gregg's Story */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="xl">
          <ImageWrapper>
            <Image
              src="/images/bram-van-oost-eaPkue76Ip4-unsplash.jpg"
              alt="Gregg's premium car for airport transportation"
              fill
              priority
            />
          </ImageWrapper>

          <DarkerGreyBox padding="lg" rounded="md">
            <Stack spacing="md">
              <Text size="lg">
                {cmsData?.['description'] || "I'm Gregg, and I run Fairfield Airport Car Service. When you book with me, I'm the one who shows up \u2014 every time. No random drivers, no cancellations, no surprises."}
              </Text>
              <Text size="lg" color="secondary">
                {cmsData?.['description-2'] || "I started this service because I saw how unreliable airport rides had become. Drivers canceling last minute, surge pricing at 4am, strangers in dirty cars. I wanted to offer something better for Fairfield County \u2014 a service where you know exactly who's picking you up, in a clean, comfortable car, right on time."}
              </Text>
              <Text size="lg" color="secondary">
                {cmsData?.['description-3'] || "I track every flight. If your plane is early, I'm there early. If it's delayed, I adjust. You'll never land wondering where your ride is."}
              </Text>
            </Stack>
          </DarkerGreyBox>
        </Stack>
      </Container>

      {/* What You Get */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="lg">
          <H2 align="center">
            {cmsData?.['values-title'] || 'What You Get'}
          </H2>

          <DarkerGreyBox padding="lg" rounded="md">
            <Stack spacing="md">
              <ValueItem>
                <ValueIcon>&#x2713;</ValueIcon>
                <Text size="md">{cmsData?.['value-1'] || 'Same driver every trip \u2014 you\'ll know my name and my car'}</Text>
              </ValueItem>
              <ValueItem>
                <ValueIcon>&#x2713;</ValueIcon>
                <Text size="md">{cmsData?.['value-2'] || 'Real-time flight tracking \u2014 I adjust to delays automatically'}</Text>
              </ValueItem>
              <ValueItem>
                <ValueIcon>&#x2713;</ValueIcon>
                <Text size="md">{cmsData?.['value-3'] || 'Flat-rate pricing \u2014 the price you see is the price you pay'}</Text>
              </ValueItem>
              <ValueItem>
                <ValueIcon>&#x2713;</ValueIcon>
                <Text size="md">{cmsData?.['value-4'] || 'Clean, well-maintained vehicle \u2014 spotless interior, every ride'}</Text>
              </ValueItem>
              <ValueItem>
                <ValueIcon>&#x2713;</ValueIcon>
                <Text size="md">{cmsData?.['value-5'] || 'Licensed and insured \u2014 professional service you can trust'}</Text>
              </ValueItem>
            </Stack>
          </DarkerGreyBox>
        </Stack>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="lg" align="center">
          <Text align="center" size="lg">
            {cmsData?.['cta-subtitle'] || 'Ready to ride with someone you can count on?'}
          </Text>
          <Link href="/book">
            <Button variant="primary">
              {cmsData?.['cta-primary-button'] || 'Book Your Ride'}
            </Button>
          </Link>
        </Stack>
      </Container>
    </>
  );
}
