'use client';

import React, { useState, useEffect } from 'react';
import { Container, Text, Span, H2 } from '@/components/ui';
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { GridSection } from '@/components/ui';
import { SettingSection } from '@/components/ui/SettingSection';
import { ActionButtonGroup } from '@/components/ui/ActionButtonGroup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToastProvider, useToast } from '@/components/ui/ToastProvider';
import { StatusMessage } from '@/components/ui/StatusMessage';
import { Stack } from '@/components/ui/containers';
import { useAdmin } from '@/components/admin/AdminProvider';
import { getCMSConfig, updateCMSConfig } from '@/lib/services/cms-service';

const COLOR_VARIABLES = [
  { key: '--primary', label: 'Primary', description: 'Main brand color for buttons and links' },
  { key: '--secondary', label: 'Secondary', description: 'Secondary brand color for accents' },
  { key: '--accent', label: 'Accent', description: 'Accent color for highlights and emphasis' },
  { key: '--background', label: 'Background', description: 'Main background color' },
  { key: '--foreground', label: 'Foreground', description: 'Main text color' },
  { key: '--muted', label: 'Muted', description: 'Subtle text and element colors' },
  { key: '--destructive', label: 'Destructive', description: 'Error and warning colors' },
  { key: '--border', label: 'Border', description: 'Border and divider colors' },
];

const getCSSVar = (key: string) =>
  typeof window !== 'undefined'
    ? getComputedStyle(document.documentElement).getPropertyValue(key).trim()
    : '';

const setCSSVar = (key: string, value: string) => {
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty(key, value);
  }
};

function AdminColorsPageContent() {
  const { addToast } = useToast();
  const [colors, setColors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadColors();
  }, []);

  const loadColors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const config = await getCMSConfig();
      const saved = config?.themeColors || {};
      const initial: Record<string, string> = {};
      
      for (const { key } of COLOR_VARIABLES) {
        initial[key] = saved[key] || getCSSVar(key) || '#ffffff';
      }
      
      setColors(initial);
      addToast('success', 'Color scheme loaded successfully');
    } catch {
      const errorMsg = 'Failed to load color scheme';
      setError(errorMsg);
      addToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (key: string, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
    setCSSVar(key, value);
    
    // Update CSS custom properties for preview
    document.documentElement.style.setProperty('--color-swatch', value);
    if (key === '--background') {
      document.documentElement.style.setProperty('--preview-background', value);
    }
    if (key === '--foreground') {
      document.documentElement.style.setProperty('--preview-foreground', value);
    }
    if (key === '--primary') {
      document.documentElement.style.setProperty('--preview-primary', value);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      await updateCMSConfig({ themeColors: colors });
      addToast('success', 'Color scheme saved successfully!');
    } catch {
      const errorMsg = 'Failed to save color scheme';
      setError(errorMsg);
      addToast('error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all colors to default? This will reload the page.')) {
      COLOR_VARIABLES.forEach(({ key }) => {
        setCSSVar(key, '');
      });
      addToast('info', 'Colors reset to default');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleReload = () => {
    loadColors();
  };

  // Header actions
  const headerActions = React.useMemo(() => [
    {
      label: 'Reload',
      onClick: handleReload,
      variant: 'outline' as const,
      icon: '🔄'
    },
    {
      label: 'Reset to Default',
      onClick: handleReset,
      variant: 'secondary' as const,
      icon: '↩️'
    },
    {
      label: saving ? 'Saving...' : 'Save Colors',
      onClick: handleSave,
      variant: 'primary' as const,
      disabled: saving,
      icon: '💾'
    }
  ], [saving, handleSave, handleReload, handleReset]);

  return (
    <AdminPageWrapper
      title="Color Scheme"
      subtitle="Customize your admin and site colors"
      actions={headerActions}
      loading={loading}
      error={error}
      errorTitle="Color Scheme Error"
      loadingMessage="Loading color configuration..."
    >
      {/* Error Message */}
      {error && (
        <StatusMessage 
          type="error" 
          message={error} 
          onDismiss={() => setError(null)} 
        />
      )}

      <GridSection variant="content" columns={1}>
        <Container>
          {/* Color Configuration */}
          <SettingSection
            title="Theme Colors"
            description="Configure the main colors used throughout your application"
            icon="🎨"
          >
            <Stack spacing="lg">
              {COLOR_VARIABLES.map(({ key, label, description }) => (
                <Container key={key}>
                  <Stack spacing="md">
                    <Stack direction="horizontal" spacing="sm" align="center">
                      <div
                        data-color={colors[key] || '#ffffff'}
                        style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: colors[key] || '#ffffff' }}
                      />
                      <Span>
                        {label}
                      </Span>
                    </Stack>
                    
                    <Text>
                      {description}
                    </Text>
                    
                    <Stack direction="horizontal" spacing="sm">
                      <Input
                        type="color"
                        value={colors[key] || '#ffffff'}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                      />
                      <Input
                        type="text"
                        value={colors[key] || ''}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        placeholder="#ffffff"
                      />
                    </Stack>
                  </Stack>
                </Container>
              ))}
            </Stack>
          </SettingSection>

          {/* Live Preview */}
          <SettingSection
            title="Live Preview"
            description="See how your color scheme looks in real-time"
            icon="👀"
          >
            <Container 
              data-background={colors['--background'] || 'var(--background-primary)'}
              data-foreground={colors['--foreground'] || 'var(--text-primary)'}
            >
              <H2 
                data-primary={colors['--primary'] || 'var(--primary-color)'}
              >
                Primary Color Example
              </H2>
              
              <Text>
                This is a preview of your current color scheme. The colors you choose will be applied throughout your application.
              </Text>
              
              <ActionButtonGroup
                buttons={[
                  {
                    label: 'Primary Gradient',
                    onClick: () => addToast('info', 'This is how primary buttons look'),
                    variant: 'primary' as const,
                    icon: '🎨'
                  },
                  {
                    label: 'Outline Style',
                    onClick: () => addToast('info', 'This is how outline buttons look'),
                    variant: 'outline' as const,
                    icon: '⭕'
                  },
                  {
                    label: 'Secondary Color',
                    onClick: () => addToast('info', 'This is how secondary buttons look'),
                    variant: 'secondary' as const,
                    icon: '🔘'
                  }
                ]}
                orientation="horizontal"
                spacing="sm"
              />
            </Container>
          </SettingSection>
        </Container>
      </GridSection>
    </AdminPageWrapper>
  );
}

export default function AdminColorsPage() {
  return (
    <ToastProvider>
      <AdminColorsPageContent />
    </ToastProvider>
  );
}
