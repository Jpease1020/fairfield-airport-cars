'use client';

import React from 'react';
import { Container, Stack, H1, Text, Button, Box } from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';
import styled from 'styled-components';
import { colors } from '@/design/system/tokens/tokens';

const OfflineCard = styled(Box)`
  text-align: center;
  background-color: ${colors.background.primary};
`;

const EmojiDisplay = styled.div`
  font-size: 4rem;
`;

export default function OfflinePage() {
  const { cmsData: allCmsData } = useCMSData();
  const pageCmsData = allCmsData?.['offline'] || {};

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <Container padding="xl" maxWidth="md">
      <OfflineCard 
        variant="elevated" 
        padding="xl" 
        rounded="lg"
      >
        <Stack spacing="lg" align="center">
          <EmojiDisplay>📱</EmojiDisplay>
          
          <H1 color="primary" cmsId="offline-title">
            {pageCmsData?.['offline-title'] || "You're Offline"}
          </H1>
          
          <Text size="lg" color="secondary" align="center" cmsId="offline-description">
            {pageCmsData?.['offline-description'] || "It looks like you're not connected to the internet right now. Don't worry - you can still browse some parts of the app!"}
          </Text>
          
          <Stack spacing="md" align="center">
            <Text size="sm" color="secondary" cmsId="offline-when-online">
              {pageCmsData?.['offline-when-online'] || 'When you\'re back online, you can:'}
            </Text>
            
            <Stack spacing="sm" align="flex-start">
              <Text size="sm" cmsId="offline-feature-1">{pageCmsData?.['offline-feature-1'] || '• Book airport transportation'}</Text>
              <Text size="sm" cmsId="offline-feature-2">{pageCmsData?.['offline-feature-2'] || '• View your existing bookings'}</Text>
              <Text size="sm" cmsId="offline-feature-3">{pageCmsData?.['offline-feature-3'] || '• Track your driver in real-time'}</Text>
              <Text size="sm" cmsId="offline-feature-4">{pageCmsData?.['offline-feature-4'] || '• Get notifications about your ride'}</Text>
            </Stack>
          </Stack>
          
          <Stack spacing="md" direction={{ xs: 'vertical', sm: 'horizontal' }} align="center">
            <Button
              onClick={handleRetry}
              variant="primary"
              size="lg"
              cmsId="offline-try-again"
            >
              {pageCmsData?.['offline-try-again'] || 'Try Again'}
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="secondary"
              size="lg"
              cmsId="offline-go-home"
            >
              {pageCmsData?.['offline-go-home'] || 'Go Home'}
            </Button>
          </Stack>
          
          <Text size="xs" color="secondary" align="center" cmsId="offline-assistance">
            {pageCmsData?.['offline-assistance'] || 'Need immediate assistance? Text us at (646) 221-6370'}
          </Text>
        </Stack>
      </OfflineCard>
    </Container>
  );
}



