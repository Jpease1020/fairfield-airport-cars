'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminPageWrapper, ContentBox, GridSection, ActionGrid, Container, H3, Text, Button } from '@/ui';
import { Stack } from '@/ui';
import { EditableText } from '@/ui';

const AIAssistantDisabledPage = () => {
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
          window.location.href = '/admin';
        }
      }}
    >
      🔙 Back to Dashboard
    </Button>,
    <Button
      key="support"
      variant="primary"
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/help';
        }
      }}
    >
      📞 Contact Support
    </Button>
  ], []);

  const quickActions = [
    {
      id: 1,
      icon: "📋",
      label: "View Documentation",
      href: "/admin/help"
    },
    {
      id: 2,
      icon: "🔧",
      label: "System Settings",
      href: "/admin/cms"
    },
    {
      id: 3,
      icon: "📊",
      label: "View Dashboard",
      href: "/admin"
    },
    {
      id: 4,
      icon: "💬",
      label: "Contact Support",
      href: "/admin/help"
    }
  ];

  if (!isClient) {
    return (
      <AdminPageWrapper
        title="AI Assistant"
        subtitle="Loading AI assistant configuration..."
      >
        <Container>
          <EditableText field="admin.aiAssistant.loading" defaultValue="Loading...">
            Loading...
          </EditableText>
        </Container>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="AI Assistant Disabled"
      subtitle="The AI assistant feature is currently disabled for your account"
    >
      <GridSection variant="content" columns={1}>
        <ContentBox variant="elevated" padding="lg">
            <Stack spacing="md">
              <Stack spacing="sm">
                <Text variant="lead" size="md" weight="semibold">🤖 AI Assistant Status</Text>
                <Text variant="muted" size="sm">Information about AI assistant availability and activation</Text>
              </Stack>
          <Stack spacing="md" align="center">
            <Text size="xl">🚫</Text>
            <H3>
              <EditableText field="admin.aiAssistant.notAvailable.title" defaultValue="AI Assistant Not Available">
                AI Assistant Not Available
              </EditableText>
            </H3>
            <Text>
              <EditableText field="admin.aiAssistant.notAvailable.description" defaultValue="The AI assistant feature is currently disabled for your account. This feature may be enabled in future updates or through your subscription plan.">
                The AI assistant feature is currently disabled for your account. 
                This feature may be enabled in future updates or through your subscription plan.
              </EditableText>
            </Text>
          </Stack>
          </Stack>
        </ContentBox>
      </GridSection>

      <GridSection variant="actions" columns={1}>
        <ContentBox variant="elevated" padding="lg">
            <Stack spacing="md">
              <Stack spacing="sm">
                <Text variant="lead" size="md" weight="semibold">⚡ Available Actions</Text>
                <Text variant="muted" size="sm">Alternative tools and features you can access</Text>
              </Stack>
          <ActionGrid actions={quickActions} columns={4} />
          </Stack>
        </ContentBox>
      </GridSection>
    </AdminPageWrapper>
  );
};

export default AIAssistantDisabledPage; 