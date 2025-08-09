'use client';

import React from 'react';
import { Container, H2, Text, Button } from '@/ui';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

export default function PerformanceTestPage() {
  const { cmsData, loading, error } = useCMSData();

  if (loading) {
    return (
      <Container variant="elevated" padding="lg">
        <H2>Loading CMS data...</H2>
      </Container>
    );
  }

  if (error) {
    return (
      <Container variant="elevated" padding="lg">
        <H2>Error loading CMS data: {error}</H2>
      </Container>
    );
  }

  return (
    <Container variant="elevated" padding="lg">
      <H2>Performance Test Page</H2>
      <Text>
        CMS Data loaded successfully! This page should load quickly now.
      </Text>
      <Text>
        Company Name: {getCMSField(cmsData, 'business.company.name', 'Not found')}
      </Text>
      <Text>
        Home Title: {getCMSField(cmsData, 'pages.home.title', 'Not found')}
      </Text>
      <Button onClick={() => window.location.reload()}>
        Reload Page
      </Button>
    </Container>
  );
}
