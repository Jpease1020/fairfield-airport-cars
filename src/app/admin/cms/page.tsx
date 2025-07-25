'use client';

import { useState, useEffect } from 'react';
import withAuth from '../withAuth';
import { cmsService } from '@/lib/services/cms-service';
import { CMSConfiguration } from '@/types/cms';
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

  const cmsSections = [
    {
      id: 'pages',
      title: 'Page Content',
      description: 'Edit homepage, help page, and other content',
      icon: '📄',
      href: '/admin/cms/pages',
      color: 'cms-card-blue',
      stats: {
        pages: config?.pages ? Object.keys(config.pages).length : 0,
        lastUpdated: lastUpdated
      }
    },
    {
      id: 'business',
      title: 'Business Settings',
      description: 'Company info, contact details, and branding',
      icon: '⚙️',
      href: '/admin/cms/business',
      color: 'cms-card-green',
      stats: {
        companyName: config?.business.company.name || 'Not set',
        lastUpdated: lastUpdated
      }
    },
    {
      id: 'pricing',
      title: 'Pricing & Rates',
      description: 'Fare structure, zones, and cancellation policies',
      icon: '💰',
      href: '/admin/cms/pricing',
      color: 'cms-card-yellow',
      stats: {
        baseFare: config?.pricing.baseFare || 0,
        lastUpdated: lastUpdated
      }
    },
    {
      id: 'payment',
      title: 'Payment Settings',
      description: 'Square and Stripe configuration',
      icon: '💳',
      href: '/admin/cms/payment',
      color: 'cms-card-purple',
      stats: {
        configured: config?.payment.square.applicationId ? 'Yes' : 'No',
        lastUpdated: lastUpdated
      }
    },
    {
      id: 'communication',
      title: 'Communication Templates',
      description: 'Email and SMS templates for bookings',
      icon: '📧',
      href: '/admin/cms/communication',
      color: 'cms-card-red',
      stats: {
        templates: 4, // Fixed number of template types
        lastUpdated: lastUpdated
      }
    },
    {
      id: 'drivers',
      title: 'Driver Management',
      description: 'Driver requirements, compensation, and scheduling',
      icon: '👥',
      href: '/admin/cms/drivers',
      color: 'cms-card-indigo',
      stats: {
        minAge: config?.driver.requirements.minimumAge || 0,
        lastUpdated: lastUpdated
      }
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      description: 'Google Analytics and reporting settings',
      icon: '📊',
      href: '/admin/cms/analytics',
      color: 'cms-card-orange',
      stats: {
        enabled: config?.analytics.googleAnalytics.enabled ? 'Yes' : 'No',
        lastUpdated: lastUpdated
      }
    }
  ];

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">
          <div className="loading-spinner-icon">🔄</div>
          <p>Loading CMS configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="section-header">
        <h1 className="page-title">Content Management System</h1>
        <p className="page-subtitle">Manage all website content and business settings</p>
        <div className="header-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <span className="btn-icon">🔄</span>
            Refresh
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={handleInitializeCMS}
            disabled={loading}
          >
            <span className="btn-icon">💾</span>
            Initialize CMS
          </button>
          {lastUpdated && (
            <span className="badge">
              <span className="badge-icon">⏰</span>
              Updated ({new Date(lastUpdated).toLocaleDateString()})
            </span>
          )}
        </div>
      </div>

      <div className="standard-content">
        <div className="grid grid-3 gap-lg">
          {cmsSections.map((section) => (
            <div key={section.id} className={`card cms-card ${section.color}`}>
              <div className="card-header">
                <div className="cms-card-title-row">
                  <div className="cms-card-icon-wrapper">
                    <span className="cms-card-icon">{section.icon}</span>
                  </div>
                  <div className="cms-card-info">
                    <h3 className="card-title">{section.title}</h3>
                    <p className="card-description">{section.description}</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="cms-card-status">
                  <div className="status-row">
                    <span className="status-label">Status:</span>
                    <span className="badge">
                      {section.id === 'pricing' && `$${section.stats.baseFare} base fare`}
                      {section.id === 'business' && section.stats.companyName}
                      {section.id === 'payment' && section.stats.configured}
                      {section.id === 'communication' && `${section.stats.templates} templates`}
                      {section.id === 'drivers' && `${section.stats.minAge}+ years`}
                      {section.id === 'analytics' && section.stats.enabled}
                      {section.id === 'pages' && `${section.stats.pages} pages`}
                    </span>
                  </div>
                  
                  <Link href={section.href} className="btn btn-outline cms-manage-btn">
                    Manage {section.title}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              <button className="quick-action-card">
                <div className="action-icon">💾</div>
                <span className="action-label">Backup Configuration</span>
              </button>
              <button className="quick-action-card">
                <div className="action-icon">🔄</div>
                <span className="action-label">Restore Defaults</span>
              </button>
              <button className="quick-action-card">
                <div className="action-icon">📅</div>
                <span className="action-label">View History</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(CMSPage); 