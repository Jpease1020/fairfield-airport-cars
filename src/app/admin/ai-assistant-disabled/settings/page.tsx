'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminPageWrapper, InfoCard, GridSection, ActionGrid } from '@/components/ui';

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
          <div className="ai-assistant-settings-container">
            <h3 className="ai-assistant-settings-title">
              🚫 Feature Not Available
            </h3>
            <p className="ai-assistant-settings-description">
              The AI assistant feature is currently disabled for your account. This may be due to:
            </p>
            <ul className="ai-assistant-settings-list">
              <li>Subscription plan limitations</li>
              <li>Regional availability restrictions</li>
              <li>System maintenance or updates</li>
              <li>Account configuration settings</li>
            </ul>
            <p className="ai-assistant-settings-note">
              Contact support for information about enabling this feature.
            </p>
          </div>
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