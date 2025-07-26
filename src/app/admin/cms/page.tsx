'use client';

import { useState, useEffect } from 'react';
import { cmsService } from '@/lib/services/cms-service';
import { CMSConfiguration } from '@/types/cms';
import Link from 'next/link';
import { 
  AdminPageWrapper,
  GridSection, 
  InfoCard, 
  ActionGrid
} from '@/components/ui';

const CMSPage = () => {
  const [config, setConfig] = useState<CMSConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadCMSConfig();
  }, []);

  const loadCMSConfig = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('⚙️ Loading CMS configuration...');
      
      const cmsConfig = await cmsService.getCMSConfiguration();
      setConfig(cmsConfig);
      if (cmsConfig) {
        setLastUpdated(cmsConfig.lastUpdated);
      }
      
      console.log('✅ CMS configuration loaded');
    } catch (err) {
      console.error('❌ Error loading CMS config:', err);
      setError('Failed to load CMS configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeCMS = async () => {
    try {
      setLoading(true);
      console.log('🔄 Initializing CMS...');
      
      const response = await fetch('/api/admin/init-cms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        await loadCMSConfig();
        alert('CMS initialized successfully!');
        console.log('✅ CMS initialized successfully');
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('❌ Error initializing CMS:', err);
      alert('Failed to initialize CMS: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const headerActions = [
    { 
      label: 'Refresh', 
      onClick: loadCMSConfig, 
      variant: 'outline' as const,
      disabled: loading
    },
    { 
      label: 'Export Config', 
      onClick: () => alert('Export functionality coming soon'), 
      variant: 'outline' as const 
    },
    { 
      label: 'Initialize CMS', 
      onClick: handleInitializeCMS, 
      variant: 'primary' as const,
      disabled: loading
    }
  ];

  const cmsSections = [
    {
      id: 'pages',
      title: 'Page Content',
      description: 'Edit homepage, help page, and other content',
      icon: '📄',
      href: '/admin/cms/pages',
      status: config?.pages ? `${Object.keys(config.pages).length} pages` : 'Not configured'
    },
    {
      id: 'business',
      title: 'Business Settings',
      description: 'Company info, contact details, and branding',
      icon: '⚙️',
      href: '/admin/cms/business',
      status: config?.business.company.name || 'Not set'
    },
    {
      id: 'pricing',
      title: 'Pricing & Rates',
      description: 'Fare structure, zones, and cancellation policies',
      icon: '💰',
      href: '/admin/cms/pricing',
      status: config?.pricing.baseFare ? `$${config.pricing.baseFare} base fare` : 'Not configured'
    },
    {
      id: 'colors',
      title: 'Brand & Colors',
      description: 'Website colors, fonts, and visual branding',
      icon: '🎨',
      href: '/admin/cms/colors',
      status: 'Theme configured'
    },
    {
      id: 'communication',
      title: 'Communication Templates',
      description: 'Email and SMS templates for bookings',
      icon: '📧',
      href: '/admin/cms/communication',
      status: '4 templates'
    },
    {
      id: 'drivers',
      title: 'Driver Management',
      description: 'Driver requirements, compensation, and scheduling',
      icon: '👥',
      href: '/admin/cms/drivers',
      status: config?.driver?.requirements?.minimumAge ? `${config.driver.requirements.minimumAge}+ years` : 'Not configured'
    }
  ];

  const quickActions = [
    {
      id: 1,
      icon: "💾",
      label: "Backup Configuration",
      onClick: () => alert('Backup functionality coming soon')
    },
    {
      id: 2,
      icon: "🔄",
      label: "Restore Defaults",
      onClick: () => confirm('This will reset all CMS settings to defaults. Continue?') && alert('Restore functionality coming soon')
    },
    {
      id: 3,
      icon: "📅",
      label: "View Change History",
      onClick: () => alert('Change history functionality coming soon')
    },
    {
      id: 4,
      icon: "📋",
      label: "Export All Settings",
      onClick: () => alert('Export functionality coming soon')
    }
  ];

  return (
    <AdminPageWrapper
      title="Content Management System"
      subtitle="Manage all website content and business settings"
      actions={headerActions}
      loading={loading}
      error={error}
      loadingMessage="Loading CMS configuration..."
      errorTitle="CMS Load Error"
    >
      {/* CMS Sections Grid */}
      <GridSection variant="content" columns={3}>
        {cmsSections.map((section) => (
          <InfoCard
            key={section.id}
            title={`${section.icon} ${section.title}`}
            description={section.description}
          >
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <div style={{ 
                marginBottom: 'var(--spacing-md)',
                padding: 'var(--spacing-sm)',
                backgroundColor: 'var(--background-secondary)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ 
                  fontSize: 'var(--font-size-xs)', 
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--spacing-xs)'
                }}>
                  Status:
                </div>
                <div style={{ fontWeight: '500', fontSize: 'var(--font-size-sm)' }}>
                  {section.status}
                </div>
              </div>
              
              <Link href={section.href}>
                <button className="btn btn-outline" style={{ width: '100%' }}>
                  Manage {section.title}
                </button>
              </Link>
            </div>
          </InfoCard>
        ))}
      </GridSection>

      {/* Quick Actions */}
      <GridSection variant="actions" columns={1}>
        <InfoCard
          title="⚡ Quick Actions"
          description="Common CMS management and maintenance tasks"
        >
          <ActionGrid actions={quickActions} columns={4} />
        </InfoCard>
      </GridSection>

      {/* Last Updated Info */}
      {lastUpdated && (
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="🕒 Configuration Status"
            description="CMS configuration and update information"
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--spacing-md)',
              marginTop: 'var(--spacing-md)'
            }}>
              <div style={{
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--background-secondary)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontWeight: '500', marginBottom: 'var(--spacing-xs)' }}>
                  Last Updated
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  {new Date(lastUpdated).toLocaleDateString()} at {new Date(lastUpdated).toLocaleTimeString()}
                </div>
              </div>
              
              <div style={{
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--background-secondary)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontWeight: '500', marginBottom: 'var(--spacing-xs)' }}>
                  Configuration Status
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  {config ? 'Fully Configured' : 'Needs Setup'}
                </div>
              </div>
              
              <div style={{
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--background-secondary)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontWeight: '500', marginBottom: 'var(--spacing-xs)' }}>
                  Auto-Save
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  All changes are automatically saved and synchronized
                </div>
              </div>
            </div>
          </InfoCard>
        </GridSection>
      )}
    </AdminPageWrapper>
  );
};

export default CMSPage; 