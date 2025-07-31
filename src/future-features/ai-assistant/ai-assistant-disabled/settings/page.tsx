'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminPageWrapper, GridSection, ActionGrid, Container, H3, Text, Button } from '@/ui';
import { Stack } from '@/ui';
import { ContentBox } from '@/ui';
import { EditableText } from '@/ui';

const AIAssistantSettingsPage = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const headerActions = useMemo(() => [
    <Button
      key="back"
      variant="outline"
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/ai-assistant-disabled';
        }
      }}
    >
      🔙 Back to AI Assistant
    </Button>
  ], []);

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

  if (!isClient) {
    return (
      <AdminPageWrapper
        title="AI Assistant Settings"
        subtitle="Loading configuration..."
      >
        <Text>
          <EditableText field="aiAssistantSettings.loading" defaultValue="Loading...">
            Loading...
          </EditableText>
        </Text>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="AI Assistant Settings"
      subtitle="Configure AI assistant preferences and access"
    >
      <GridSection variant="content" columns={1}>
        <ContentBox variant="elevated" padding="lg">
          <Stack spacing="md">
            <Text size="lg" weight="bold">⚙️ AI Assistant Configuration</Text>
            <Text>Current status and available options</Text>
          <Container>
            <H3>
              <EditableText field="aiAssistantSettings.featureNotAvailable" defaultValue="🚫 Feature Not Available">
                🚫 Feature Not Available
              </EditableText>
            </H3>
            <Text>
              <EditableText field="aiAssistantSettings.disabledDescription" defaultValue="The AI assistant feature is currently disabled for your account. This may be due to:">
                The AI assistant feature is currently disabled for your account. This may be due to:
              </EditableText>
            </Text>
            <Stack spacing="sm">
              <Text>
                <EditableText field="aiAssistantSettings.subscriptionLimitations" defaultValue="• Subscription plan limitations">
                  • Subscription plan limitations
                </EditableText>
              </Text>
              <Text>
                <EditableText field="aiAssistantSettings.regionalRestrictions" defaultValue="• Regional availability restrictions">
                  • Regional availability restrictions
                </EditableText>
              </Text>
              <Text>
                <EditableText field="aiAssistantSettings.systemMaintenance" defaultValue="• System maintenance or updates">
                  • System maintenance or updates
                </EditableText>
              </Text>
              <Text>
                <EditableText field="aiAssistantSettings.accountConfiguration" defaultValue="• Account configuration settings">
                  • Account configuration settings
                </EditableText>
              </Text>
            </Stack>
            <Text>
              <EditableText field="aiAssistantSettings.contactSupport" defaultValue="Contact support for information about enabling this feature.">
                Contact support for information about enabling this feature.
              </EditableText>
            </Text>
          </Container>
          </Stack>
        </ContentBox>
      </GridSection>

      <GridSection variant="actions" columns={1}>
        <ContentBox variant="elevated" padding="lg">
          <Stack spacing="md">
            <Text size="lg" weight="bold">📋 Available Options</Text>
            <Text>Alternative features and support resources</Text>
            <ActionGrid actions={settingsInfo} columns={4} />
          </Stack>
        </ContentBox>
      </GridSection>
    </AdminPageWrapper>
  );
};

export default AIAssistantSettingsPage; 