'use client';

import { useEffect, useState } from 'react';
import { GridSection, ActionGrid, Container, H3, Text, Stack, Box } from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';

const AIAssistantSettingsPage = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const settingsInfo = [
    {
      id: 1,
      icon: "🤖",
      label: "AI Assistant Status",
      description: "Currently disabled for this account"
    },
    {
      id: 2,
      icon: "📞",
      label: "Contact Support",
      description: "Get help with AI assistant features"
    },
    {
      id: 3,
      icon: "📚",
      label: "Documentation",
      description: "Learn about AI assistant capabilities"
    },
    {
      id: 4,
      icon: "🔧",
      label: "System Settings",
      description: "Manage other system configurations"
    }
  ];

  const { cmsData } = useCMSData();

  if (!isClient) {
    return (
      
        <Text>
          {getCMSField(cmsData, 'aiAssistantSettings-loading', 'Loading...')}
        </Text>
      
    );
  }

  return (
    <>
      <GridSection variant="content" columns={1}>
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Text size="lg" weight="bold">⚙️ AI Assistant Configuration</Text>
            <Text>Current status and available options</Text>
          <Container>
            <H3>
              {getCMSField(cmsData, 'aiAssistantSettings-featureNotAvailable', '🚫 Feature Not Available')}
            </H3>
            <Text>
              {getCMSField(cmsData, 'aiAssistantSettings-disabledDescription', 'The AI assistant feature is currently disabled for your account. This may be due to:')}
            </Text>
            <Stack spacing="sm">
              <Text>
                {getCMSField(cmsData, 'aiAssistantSettings-subscriptionLimitations', '• Subscription plan limitations')}
              </Text>
              <Text>
                {getCMSField(cmsData, 'aiAssistantSettings-regionalRestrictions', '• Regional availability restrictions')}
              </Text>
              <Text>
                {getCMSField(cmsData, 'aiAssistantSettings-systemMaintenance', '• System maintenance or updates')}
              </Text>
              <Text>
                {getCMSField(cmsData, 'aiAssistantSettings-accountConfiguration', '• Account configuration settings')}
              </Text>
            </Stack>
            <Text>
              {getCMSField(cmsData, 'aiAssistantSettings-contactSupport', 'Contact support for information about enabling this feature.')}
            </Text>
          </Container>
          </Stack>
        </Box>
      </GridSection>

      <GridSection variant="actions" columns={1}>
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Text size="lg" weight="bold">📋 Available Options</Text>
            <Text>Alternative features and support resources</Text>
            <ActionGrid actions={settingsInfo} columns={4} />
          </Stack>
        </Box>
      </GridSection>
    </>
  );
};

export default AIAssistantSettingsPage; 