'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminPageWrapper, InfoCard, GridSection, ActionGrid, Container, H3, Text, EditableText } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

const AIAssistantDisabledPage = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const headerActions = useMemo(() => [
    { 
      label: 'Back to Dashboard',
      onClick: () => {
        if (typeof window !== 'undefined') {
          window.location.href = '/admin';
        }
      },
      variant: 'outline' as const,
      icon: '🔙'
    },
    { 
      label: 'Contact Support', 
      onClick: () => {
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/help';
        }
      },
      variant: 'primary' as const,
      icon: '📞'
    }
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
        <InfoCard
          title="🤖 AI Assistant Status"
          description="Information about AI assistant availability and activation"
        >
          <Stack spacing="md" align="center">
            <Text size="xl">🚫</Text>
            <H3>
              AI Assistant Not Available
            </H3>
            <Text>
              The AI assistant feature is currently disabled for your account. 
              This feature may be enabled in future updates or through your subscription plan.
            </Text>
          </Stack>
        </InfoCard>
      </GridSection>

      <GridSection variant="actions" columns={1}>
        <InfoCard
          title="⚡ Available Actions"
          description="Alternative tools and features you can access"
        >
          <ActionGrid actions={quickActions} columns={4} />
        </InfoCard>
      </GridSection>
    </AdminPageWrapper>
  );
};

export default AIAssistantDisabledPage; 