'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  AdminPageWrapper,
  SettingSection,
  SettingInput,
  ActionButtonGroup,
  StatusMessage,
  ToastProvider,
  useToast,
  GridSection
} from '@/components/ui';
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
  const headerActions = useMemo(() => [
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
        <div className="admin-colors-container">
          {/* Color Configuration */}
          <SettingSection
            title="Theme Colors"
            description="Configure the main colors used throughout your application"
            icon="🎨"
          >
            <div className="admin-colors-grid">
              {COLOR_VARIABLES.map(({ key, label, description }) => (
                <div key={key} className="admin-color-item">
                  <div className="admin-color-header">
                    <div
                      className="admin-color-swatch"
                      style={{ backgroundColor: colors[key] || '#ffffff' }}
                    />
                    <strong className="admin-color-label">
                      {label}
                    </strong>
                  </div>
                  
                  <p className="admin-color-description">
                    {description}
                  </p>
                  
                  <div className="admin-color-controls">
                    <input
                      type="color"
                      value={colors[key] || '#ffffff'}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="admin-color-picker"
                    />
                    <input
                      type="text"
                      value={colors[key] || ''}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      placeholder="#ffffff"
                      className="admin-color-input"
                    />
                  </div>
                </div>
              ))}
            </div>
          </SettingSection>

          {/* Live Preview */}
          <SettingSection
            title="Live Preview"
            description="See how your color scheme looks in real-time"
            icon="👀"
          >
            <div 
              className="admin-colors-preview"
              style={{
                backgroundColor: colors['--background'] || 'var(--background-primary)',
                color: colors['--foreground'] || 'var(--text-primary)'
              }}
            >
              <h2 
                className="admin-colors-preview-title"
                style={{ color: colors['--primary'] || 'var(--primary-color)' }}
              >
                Primary Color Example
              </h2>
              
              <p className="admin-colors-preview-description">
                This is a preview of your current color scheme. The colors you choose will be applied throughout your application.
              </p>
              
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
            </div>
          </SettingSection>
        </div>
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
