'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Span, GridSection, Stack, Button, Input, ToastProvider, useToast, StatusMessage, EditableText, EditableHeading } from '@/ui';
import { getCMSConfig } from '@/lib/services/cms-service';
import { AdminPageWrapper } from '@/components/app';

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
  const [error, setError] = useState<string | null>(null);

  const loadColors = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const config = await getCMSConfig();
      const saved = config?.themeColors || {};
      const initial: Record<string, string> = {};
      
      for (const { key } of COLOR_VARIABLES) {
        initial[key] = saved[key] || getCSSVar(key) || 'var(--color-default)';
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
  }, [addToast]);

  useEffect(() => {
    loadColors();
  }, [loadColors]);

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

  return (
    <AdminPageWrapper
      title="Color Scheme"
      subtitle="Customize your admin and site colors"
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
          <Container>
            <Span>Theme Colors</Span>
            <Span>Configure the main colors used throughout your application</Span>
            <Span>🎨</Span>
            <Stack spacing="lg">
              {COLOR_VARIABLES.map(({ key, label, description }) => (
                <Container key={key}>
                  <Stack direction="horizontal" spacing="sm" align="center">
                    <Span
                      data-color={colors[key] || 'var(--color-default)'}
                    >
                      ●
                    </Span>
                    <Span>
                      <EditableText field={`admin.cms.colors.${key.replace('--', '')}`} defaultValue={label}>
                        {label}
                      </EditableText>
                    </Span>
                  </Stack>
                  
                  <EditableText field="admin.cms.colors.description" defaultValue={description}>
                    {description}
                  </EditableText>
                  
                  <Stack direction="horizontal" spacing="sm">
                    <Input
                      type="color"
                      value={colors[key] || 'var(--color-default)'}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                    />
                    <Input
                      type="text"
                      value={colors[key] || ''}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      placeholder="var(--color-default)"
                    />
                  </Stack>
                </Container>
              ))}
                          </Stack>
          </Container>

          {/* Live Preview */}
          <Container>
            <Span>Live Preview</Span>
            <Span>See how your color scheme looks in real-time</Span>
            <Span>👀</Span>
            <Container 
              data-background={colors['--background'] || 'var(--background-primary)'}
              data-foreground={colors['--foreground'] || 'var(--text-primary)'}
            >
              <EditableHeading field="admin.cms.colors.primaryExample" defaultValue="Primary Color Example">
                Primary Color Example
              </EditableHeading>
              
              <EditableText field="admin.cms.colors.previewDescription" defaultValue="This is a preview of your current color scheme. The colors you choose will be applied throughout your application.">
                This is a preview of your current color scheme. The colors you choose will be applied throughout your application.
              </EditableText>
              
              <Stack direction="horizontal" spacing="sm">
                <Button
                  variant="primary"
                  onClick={() => addToast('info', 'This is how primary buttons look')}
                >
                  🎨 Primary Gradient
                </Button>
                <Button
                  variant="outline"
                  onClick={() => addToast('info', 'This is how outline buttons look')}
                >
                  ⭕ Outline Style
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => addToast('info', 'This is how secondary buttons look')}
                >
                  🔘 Secondary Color
                </Button>
              </Stack>
            </Container>
          </Container>
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
