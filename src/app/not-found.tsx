'use client';

import { Container, Stack, Text, Button } from '@/design/ui';
import Link from 'next/link';
import { useCMSData } from '@/design/providers/CMSDataProvider';

export default function NotFound() {
  const cmsData = useCMSData();
  
  return (
    <Container>
      <Stack spacing="xl" align="center" justify="center">
        <Text variant="lead" size="xl" weight="bold">
          {(cmsData as any)?.['not-found-title'] || '404'}
        </Text>
        <Text variant="lead" size="lg">
          {(cmsData as any)?.['not-found-subtitle'] || 'Page Not Found'}
        </Text>
        <Text variant="body" align="center">
          {(cmsData as any)?.['not-found-message'] || "The page you're looking for doesn't exist or has been moved."}
        </Text>
        <Link href="/">
          <Button variant="primary">
            {(cmsData as any)?.['not-found-cta'] || 'Go Home'}
          </Button>
        </Link>
      </Stack>
    </Container>
  );
}
