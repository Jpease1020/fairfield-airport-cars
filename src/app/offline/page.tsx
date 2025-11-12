'use client';

import React from 'react';
import { Container, Stack, H1, Text, Button, Box } from '@/design/ui';
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
          
          <H1 color="primary">
            You're Offline
          </H1>
          
          <Text size="lg" color="secondary" align="center">
            It looks like you're not connected to the internet right now. 
            Don't worry - you can still browse some parts of the app!
          </Text>
          
          <Stack spacing="md" align="center">
            <Text size="sm" color="secondary">
              When you're back online, you can:
            </Text>
            
            <Stack spacing="sm" align="flex-start">
              <Text size="sm">• Book airport transportation</Text>
              <Text size="sm">• View your existing bookings</Text>
              <Text size="sm">• Track your driver in real-time</Text>
              <Text size="sm">• Get notifications about your ride</Text>
            </Stack>
          </Stack>
          
          <Stack spacing="md" direction={{ xs: 'vertical', sm: 'horizontal' }} align="center">
            <Button
              onClick={handleRetry}
              variant="primary"
              size="lg"
            >
              Try Again
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="secondary"
              size="lg"
            >
              Go Home
            </Button>
          </Stack>
          
          <Text size="xs" color="secondary" align="center">
            Need immediate assistance? Text us at (203) 555-0123
          </Text>
        </Stack>
      </OfflineCard>
    </Container>
  );
}



