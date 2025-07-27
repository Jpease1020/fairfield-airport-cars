'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminPageWrapper, InfoCard, GridSection, ActionGrid, Container, H3, Text } from '@/components/ui';
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
        <div>Loading...</div>
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
              🚫 Feature Not Available
            </H3>
            <Text>
              The AI assistant feature is currently disabled for your account. This may be due to:
            </Text>
            <Stack spacing="sm">
              <Text>• Subscription plan limitations</Text>
              <Text>• Regional availability restrictions</Text>
              <Text>• System maintenance or updates</Text>
              <Text>• Account configuration settings</Text>
            </Stack>
            <Text>
              Contact support for information about enabling this feature.
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