'use client';

import { useState, useEffect } from 'react';
import withAuth from '../withAuth';
import { cmsService } from '@/lib/cms-service';
import { CMSConfiguration } from '@/types/cms';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { 
  Settings, 
  FileText, 
  DollarSign, 
  CreditCard, 
  Mail, 
  Users, 
  BarChart3,
  Calendar,
  Clock,
  Save,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

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
      setLastUpdated(cmsConfig.lastUpdated);
    } catch (error) {
      console.error('Error loading CMS config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    cmsService.clearCache();
    loadCMSConfig();
  };

  const handleInitializeCMS = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/init-cms', {
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

  const cmsSections = [
    {
      id: 'pages',
      title: 'Page Content',
      description: 'Edit homepage, help page, and other content',
      icon: FileText,
      href: '/admin/cms/pages',
      color: 'bg-blue-500',
      stats: {
        pages: config?.pages ? Object.keys(config.pages).length : 0,
        lastUpdated: lastUpdated
      }
    },
    {
      id: 'business',
      title: 'Business Settings',
      description: 'Company info, contact details, and branding',
      icon: Settings,
      href: '/admin/cms/business',
      color: 'bg-green-500',
      stats: {
        companyName: config?.business.company.name || 'Not set',
        lastUpdated: lastUpdated
      }
    },
    {
      id: 'pricing',
      title: 'Pricing & Rates',
      description: 'Fare structure, zones, and cancellation policies',
      icon: DollarSign,
      href: '/admin/cms/pricing',
      color: 'bg-yellow-500',
      stats: {
        baseFare: config?.pricing.baseFare || 0,
        lastUpdated: lastUpdated
      }
    },
    {
      id: 'payment',
      title: 'Payment Settings',
      description: 'Square and Stripe configuration',
      icon: CreditCard,
      href: '/admin/cms/payment',
      color: 'bg-purple-500',
      stats: {
        configured: config?.payment.square.applicationId ? 'Yes' : 'No',
        lastUpdated: lastUpdated
      }
    },
    {
      id: 'communication',
      title: 'Communication Templates',
      description: 'Email and SMS templates for bookings',
      icon: Mail,
      href: '/admin/cms/communication',
      color: 'bg-red-500',
      stats: {
        templates: 4, // Fixed number of template types
        lastUpdated: lastUpdated
      }
    },
    {
      id: 'drivers',
      title: 'Driver Management',
      description: 'Driver requirements, compensation, and scheduling',
      icon: Users,
      href: '/admin/cms/drivers',
      color: 'bg-indigo-500',
      stats: {
        minAge: config?.driver.requirements.minimumAge || 0,
        lastUpdated: lastUpdated
      }
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      description: 'Google Analytics and reporting settings',
      icon: BarChart3,
      href: '/admin/cms/analytics',
      color: 'bg-orange-500',
      stats: {
        enabled: config?.analytics.googleAnalytics.enabled ? 'Yes' : 'No',
        lastUpdated: lastUpdated
      }
    }
  ];

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Content Management System" />
        <PageContent>
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  return (
    <>
      <AdminNavigation />
      <PageContainer>
        <PageHeader 
          title="Content Management System" 
          subtitle="Manage all website content and business settings"
        >
                  <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleInitializeCMS}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              Initialize CMS
            </Button>
            {lastUpdated && (
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Updated {lastUpdated.toLocaleDateString()}
              </Badge>
            )}
          </div>
      </PageHeader>

      <PageContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cmsSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card key={section.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${section.color} text-white`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <p className="text-sm text-gray-600">{section.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant="outline">
                        {section.id === 'pricing' && `$${section.stats.baseFare} base fare`}
                        {section.id === 'business' && section.stats.companyName}
                        {section.id === 'payment' && section.stats.configured}
                        {section.id === 'communication' && `${section.stats.templates} templates`}
                        {section.id === 'drivers' && `${section.stats.minAge}+ years`}
                        {section.id === 'analytics' && section.stats.enabled}
                        {section.id === 'pages' && `${section.stats.pages} pages`}
                      </Badge>
                    </div>
                    
                    <Link href={section.href}>
                      <Button className="w-full" variant="outline">
                        Manage {section.title}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Save className="h-6 w-6" />
                <span>Backup Configuration</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <RefreshCw className="h-6 w-6" />
                <span>Restore Defaults</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Calendar className="h-6 w-6" />
                <span>View History</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
    </>
  );
};

export default withAuth(CMSPage); 