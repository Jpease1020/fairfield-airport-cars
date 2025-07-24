'use client';

import { useState, useEffect } from 'react';
import { cmsService } from '@/lib/services/cms-service';
import { BusinessSettings } from '@/types/cms';

export function useBusinessSettings() {
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBusinessSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const settings = await cmsService.getBusinessSettings();
        setBusinessSettings(settings);
      } catch (err) {
        console.error('Error loading business settings:', err);
        setError('Failed to load business settings');
      } finally {
        setLoading(false);
      }
    };

    loadBusinessSettings();
  }, []);

  // Helper functions for common contact info
  const getPhoneNumber = () => businessSettings?.company?.phone || '+1-203-555-0123';
  const getEmail = () => businessSettings?.company?.email || 'info@fairfieldairportcar.com';
  const getCompanyName = () => businessSettings?.company?.name || 'Fairfield Airport Cars';
  const getAddress = () => businessSettings?.company?.address || 'Fairfield, CT';
  const getHours = () => businessSettings?.company?.hours || '24/7 Service';

  return {
    businessSettings,
    loading,
    error,
    getPhoneNumber,
    getEmail,
    getCompanyName,
    getAddress,
    getHours
  };
} 