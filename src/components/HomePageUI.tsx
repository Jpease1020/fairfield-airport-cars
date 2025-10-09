'use client';

import React from 'react';
import { Container, Stack } from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { FAQSection } from '@/components/home/FAQSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { MobileStickyButton } from '@/components/home/MobileStickyButton';
import { FinalCTASection } from '@/components/home/FinalCTASection';

const HomePageContent = () => {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const pageCmsData = allCmsData?.home || null;
  
  return (
    <>
      <HeroSection cmsData={pageCmsData} />
      
      <Container padding="xl" variant="section" data-testid="main-content-section">
        <Stack direction={{ xs: 'vertical', lg: 'horizontal' }} spacing="xl">
          <FeaturesSection cmsData={pageCmsData} />
          <FAQSection cmsData={pageCmsData} />
        </Stack>
      </Container>
      
      <TestimonialsSection cmsData={pageCmsData} />
      
      <FinalCTASection cmsData={pageCmsData} />
      <MobileStickyButton cmsData={pageCmsData} />
    </>
  );
}

export default HomePageContent;
