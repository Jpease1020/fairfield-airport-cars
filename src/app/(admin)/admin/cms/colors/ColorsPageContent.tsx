'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Span, GridSection, Stack, Button, Input, ToastProvider, useToast, StatusMessage } from '@/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';

const COLOR_VARIABLES = [
  { key: '--primary', label: 'Primary', description: 'Main brand color for buttons and links' },
  { key: '--secondary', label: 'Secondary', description: 'Secondary brand color for accents' },
  { key: '--accent', label: 'Accent', description: 'Accent color for highlights and emphasis' },
  { key: '--success', label: 'Success', description: 'Color for success states and confirmations' },
  { key: '--warning', label: 'Warning', description: 'Color for warning states and alerts' },
  { key: '--error', label: 'Error', description: 'Color for error states and failures' },
  { key: '--info', label: 'Info', description: 'Color for informational messages' },
  { key: '--background', label: 'Background', description: 'Main background color' },
  { key: '--surface', label: 'Surface', description: 'Surface color for cards and panels' },
  { key: '--text-primary', label: 'Text Primary', description: 'Primary text color' },
  { key: '--text-secondary', label: 'Text Secondary', description: 'Secondary text color' },
  { key: '--border', label: 'Border', description: 'Border color for dividers and outlines' }
];

export default function ColorsPageContent() {
  const { cmsData } = useCMSData();
  const { addToast } = useToast();
  const [colors, setColors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load current colors on mount
  useEffect(() => {
    loadCurrentColors();
  }, []);

  const loadCurrentColors = useCallback(() => {
    setLoading(true);
    try {
      // Get current CSS custom properties
      const root = document.documentElement;
      const currentColors: Record<string, string> = {};
      
      COLOR_VARIABLES.forEach(({ key }) => {
        const value = getComputedStyle(root).getPropertyValue(key).trim();
        if (value) {
          currentColors[key] = value;
        }
      });
      
      setColors(currentColors);
    } catch (error) {
      console.error('Error loading colors:', error);
      addToast('error', 'Failed to load current colors');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const handleColorChange = (key: string, value: string) => {
    setColors(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveColors = async () => {
    setSaving(true);
    try {
      // Apply colors to CSS custom properties
      const root = document.documentElement;
      Object.entries(colors).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(key, value);
        }
      });

      // Here you would typically save to your CMS/database
      // For now, we'll just show a success message
      addToast('success', 'Colors saved successfully!');
    } catch (error) {
      console.error('Error saving colors:', error);
      addToast('error', 'Failed to save colors');
    } finally {
      setSaving(false);
    }
  };

  const resetColors = () => {
    setColors({});
    // Reset CSS custom properties to default
    const root = document.documentElement;
    COLOR_VARIABLES.forEach(({ key }) => {
      root.style.removeProperty(key);
    });
    addToast('info', 'Colors reset to default');
  };

  if (loading) {
    return (
      <Container>
        <Stack spacing="xl" align="center">
          <StatusMessage type="info" message="Loading color configuration..." />
        </Stack>
      </Container>
    );
  }

  return (
    <ToastProvider>
      <Container maxWidth="full" padding="xl">
        <Stack spacing="xl">
          {/* Header */}
          <Stack spacing="sm">
            <Span cmsId="theme-colors-title" cmsData={cmsData}>Theme Colors</Span>
            <Span cmsId="theme-colors-description" cmsData={cmsData}>Configure the main colors used throughout your application</Span>
            <Span cmsId="theme-colors-emoji" cmsData={cmsData}>🎨</Span>
          </Stack>

          {/* Color Configuration Grid */}
          <GridSection variant="content" columns={2}>
            {COLOR_VARIABLES.map(({ key, label, description }) => (
              <Stack key={key} spacing="sm" padding="lg" style={{ border: '1px solid var(--border)', borderRadius: '8px' }}>
                <Stack direction="horizontal" align="center" spacing="sm">
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      backgroundColor: colors[key] || 'var(--surface)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <Span cmsId={`color-swatch-${key.replace('--', '')}`} cmsData={cmsData}>●</Span>
                  </div>
                  <Stack spacing="xs">
                    <Span cmsId={`admin.cms.colors.${key.replace('--', '')}`} cmsData={cmsData}>{label}</Span>
                    <Input
                      type="color"
                      value={colors[key] || ''}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      style={{ width: '60px', height: '32px', padding: '2px' }}
                    />
                  </Stack>
                </Stack>
                <Span cmsId="admin-cms-colors-description" cmsData={cmsData}>{description}</Span>
              </Stack>
            ))}
          </GridSection>

          {/* Action Buttons */}
          <Stack direction="horizontal" spacing="md" justify="center">
            <Button
              onClick={saveColors}
              disabled={saving}
              variant="primary"
              size="lg"
            >
              {saving ? 'Saving...' : 'Save Colors'}
            </Button>
            <Button
              onClick={resetColors}
              variant="outline"
              size="lg"
            >
              Reset to Default
            </Button>
            <Button
              onClick={loadCurrentColors}
              variant="outline"
              size="lg"
            >
              Reload Current
            </Button>
          </Stack>

          {/* Live Preview */}
          <GridSection variant="content" columns={1}>
            <Stack spacing="md" padding="lg" style={{ border: '1px solid var(--border)', borderRadius: '8px' }}>
              <Span cmsId="live-preview-title">Live Preview</Span>
              <Span cmsId="live-preview-description">See how your color scheme looks in real-time</Span>
              <Span cmsId="live-preview-emoji">👀</Span>
              
              <Stack spacing="sm">
                <Button variant="primary" size="sm">
                  <Span cmsId="admin-cms-colors-primaryExample" cmsData={cmsData}>Primary Color Example</Span>
                </Button>
                <Button variant="outline" size="sm">Secondary Button</Button>
                <Button variant="success" size="sm">Success Button</Button>
                <Button variant="warning" size="sm">Warning Button</Button>
                <Button variant="danger" size="sm">Error Button</Button>
              </Stack>
              
              <Span cmsId="admin-cms-colors-previewDescription" cmsData={cmsData}>This is a preview of your current color scheme. The colors you choose will be applied throughout your application.</Span>
            </Stack>
          </GridSection>
        </Stack>
      </Container>
    </ToastProvider>
  );
}
