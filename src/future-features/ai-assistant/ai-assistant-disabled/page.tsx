'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminPageWrapper, Card, GridSection, ActionGrid, Container, H3, Text, Button } from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';
import { EditableText } from '@/design/components/core/layout/EditableSystem';

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
        actions={[]}
        loading={true}
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
      actions={headerActions}
    >
      <GridSection variant="content" columns={1}>
        <Card
          title="🤖 AI Assistant Status"
          description="Information about AI assistant availability and activation"
        >
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
        </Card>
      </GridSection>

      <GridSection variant="actions" columns={1}>
        <Card
          title="⚡ Available Actions"
          description="Alternative tools and features you can access"
        >
          <ActionGrid actions={quickActions} columns={4} />
        </Card>
      </GridSection>
    </AdminPageWrapper>
  );
};

export default AIAssistantDisabledPage; 