'use client';

import { useState, useEffect } from 'react';
import withAuth from '../withAuth';
import { cmsService } from '@/lib/services/cms-service';
import { CMSConfiguration } from '@/types/cms';
import Link from 'next/link';
import { 
  PageHeader, 
  GridSection, 
  InfoCard, 
  ActionGrid
} from '@/components/ui';
import { Button } from '@/components/ui/button';

const CMSPage = () => {
  const [config, setConfig] = useState<CMSConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadCMSConfig();
  }, []);

  const loadCMSConfig = async () => {
    try {
      setLoading(true);
      const cmsConfig = await cmsService.getCMSConfiguration();
      setConfig(cmsConfig);
      if (cmsConfig) {
        setLastUpdated(cmsConfig.lastUpdated);
      }
    } catch (error) {
      console.error('Error loading CMS config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadCMSConfig();
  };

  const handleInitializeCMS = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/init-cms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Reload the CMS config
        await loadCMSConfig();
        alert('CMS initialized successfully!');
      } else {
        alert('Failed to initialize CMS: ' + result.message);
      }
    } catch (error) {
      console.error('Error initializing CMS:', error);
      alert('Failed to initialize CMS. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const headerActions = [
    { 
      label: 'Refresh', 
      onClick: handleRefresh, 
      variant: 'outline' as const,
      disabled: loading
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
      id: 'payment',
      title: 'Payment Settings',
      description: 'Square and Stripe configuration',
      icon: '💳',
      href: '/admin/cms/payment',
      status: config?.payment.square.applicationId ? 'Configured' : 'Not configured'
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
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      description: 'Google Analytics and reporting settings',
      icon: '📊',
      href: '/admin/cms/analytics',
      status: config?.analytics?.googleAnalytics?.enabled ? 'Enabled' : 'Disabled'
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
      onClick: () => alert('Restore functionality coming soon')
    },
    {
      id: 3,
      icon: "📅",
      label: "View History",
      onClick: () => alert('History functionality coming soon')
    },
    {
      id: 4,
      icon: "📋",
      label: "Export Settings",
      onClick: () => alert('Export functionality coming soon')
    }
  ];

  if (loading) {
    return (
      <div className="admin-dashboard">
        <PageHeader
          title="Content Management System"
          subtitle="Loading CMS configuration..."
        />
        <div className="loading-spinner">
          <div className="loading-spinner-icon">🔄</div>
          <p>Loading CMS configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <PageHeader
        title="Content Management System"
        subtitle="Manage all website content and business settings"
        actions={headerActions}
      />

      <GridSection variant="content" columns={3}>
        {cmsSections.map((section) => (
          <InfoCard
            key={section.id}
            title={`${section.icon} ${section.title}`}
            description={section.description}
          >
            <div className="cms-section-content">
              <div className="status-info mb-4">
                <div className="status-label text-sm text-gray-600">Status:</div>
                <div className="status-value font-medium">{section.status}</div>
              </div>
              
              <Link href={section.href}>
                <Button variant="outline" className="w-full">
                  Manage {section.title}
                </Button>
              </Link>
            </div>
          </InfoCard>
        ))}
      </GridSection>

      <GridSection variant="actions" columns={1}>
        <InfoCard
          title="Quick Actions"
          description="Common CMS management tasks"
        >
          <ActionGrid actions={quickActions} columns={4} />
        </InfoCard>
      </GridSection>

      {lastUpdated && (
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="🕒 Last Updated"
            description={`Configuration last updated on ${new Date(lastUpdated).toLocaleDateString()} at ${new Date(lastUpdated).toLocaleTimeString()}`}
          >
            <div className="text-sm text-gray-600">
              All changes are automatically saved and synchronized across your website.
            </div>
          </InfoCard>
        </GridSection>
      )}
    </div>
  );
};

export default withAuth(CMSPage); 