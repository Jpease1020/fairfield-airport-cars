'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminPageWrapper, InfoCard, GridSection, ActionGrid, Container, H3, Text, EditableText } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

const AIAssistantSettingsPage = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const headerActions = useMemo(() => [
    { 
      label: 'Back to AI Assistant',
      onClick: () => {
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/ai-assistant-disabled';
        }
      },
      variant: 'outline' as const,
      icon: '🔙'
    }
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
        actions={[]}
        loading={true}
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
      actions={headerActions}
    >
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="⚙️ AI Assistant Configuration"
          description="Current status and available options"
        >
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
        </InfoCard>
      </GridSection>

      <GridSection variant="actions" columns={1}>
        <InfoCard
          title="📋 Available Options"
          description="Alternative features and support resources"
        >
          <ActionGrid actions={settingsInfo} columns={4} />
        </InfoCard>
      </GridSection>
    </AdminPageWrapper>
  );
};

export default AIAssistantSettingsPage; 