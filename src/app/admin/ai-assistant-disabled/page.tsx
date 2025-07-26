'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminPageWrapper, InfoCard, GridSection, ActionGrid } from '@/components/ui';

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
        <div>Loading...</div>
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
          <div style={{
            padding: 'var(--spacing-lg)',
            textAlign: 'center',
            borderRadius: 'var(--border-radius)',
            backgroundColor: 'var(--background-secondary)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              fontSize: 'var(--font-size-xl)',
              marginBottom: 'var(--spacing-md)',
              color: 'var(--text-secondary)'
            }}>
              🚫
            </div>
            <h3 style={{
              margin: '0 0 var(--spacing-sm) 0',
              color: 'var(--text-primary)'
            }}>
              AI Assistant Not Available
            </h3>
            <p style={{
              margin: 0,
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-sm)',
              lineHeight: '1.5'
            }}>
              The AI assistant feature is currently disabled for your account. 
              This feature may be enabled in future updates or through your subscription plan.
            </p>
          </div>
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