'use client';

import { useState, useEffect } from 'react';
import { cmsFlattenedService } from '@/lib/services/cms-service';
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
        const settings = await cmsFlattenedService.getBusinessSettings();
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
  const getPhoneNumber = () => businessSettings?.company?.phone || '';
  const getEmail = () => businessSettings?.company?.email || '';
  const getCompanyName = () => businessSettings?.company?.name || '';
  const getAddress = () => businessSettings?.company?.address || '';
  const getHours = () => businessSettings?.company?.hours || '';

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