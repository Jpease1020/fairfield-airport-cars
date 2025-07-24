'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { getCMSConfig, updateCMSConfig } from '@/lib/services/cms-service';

const COLOR_VARIABLES = [
  { key: '--primary', label: 'Primary' },
  { key: '--secondary', label: 'Secondary' },
  { key: '--accent', label: 'Accent' },
  { key: '--background', label: 'Background' },
  { key: '--foreground', label: 'Foreground' },
  { key: '--muted', label: 'Muted' },
  { key: '--destructive', label: 'Destructive' },
  { key: '--border', label: 'Border' },
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

export default function AdminColorsPage() {
  const [colors, setColors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load from Firestore (CMS config) or CSS vars
    const loadColors = async () => {
      const config = await getCMSConfig();
      const saved = config?.themeColors || {};
      const initial: Record<string, string> = {};
      for (const { key } of COLOR_VARIABLES) {
        initial[key] = saved[key] || getCSSVar(key) || '#ffffff';
      }
      setColors(initial);
    };
    loadColors();
  }, []);

  const handleColorChange = (key: string, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
    setCSSVar(key, value);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateCMSConfig({ themeColors: colors });
      setMessage('Color scheme saved!');
    } catch {
      setMessage('Failed to save color scheme.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    COLOR_VARIABLES.forEach(({ key }) => {
      setCSSVar(key, '');
    });
    window.location.reload();
  };

  return (
    <PageContainer>
      <PageHeader title="Color Scheme" subtitle="Customize your admin and site colors" />
      <PageContent>
        <Card>
          <CardHeader>
            <CardTitle>Theme Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {COLOR_VARIABLES.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-4">
                  <label className="w-32 font-medium">{label}</label>
                  <Input
                    type="color"
                    value={colors[key] || '#ffffff'}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-12 h-12 p-0 border-none bg-transparent"
                  />
                  <Input
                    type="text"
                    value={colors[key] || ''}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-32"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-6">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset to Default
              </Button>
              {message && <span className="ml-4 text-sm text-gray-600">{message}</span>}
            </div>
          </CardContent>
        </Card>
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2">Live Preview</h3>
          <div className="p-8 rounded-lg border" style={{
            background: colors['--background'],
            color: colors['--foreground'],
            borderColor: colors['--border'],
          }}>
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors['--primary'] }}>Primary Color Example</h2>
            <p className="mb-2">This is a preview of your current color scheme.</p>
            <Button style={{ background: colors['--primary'], color: colors['--primary-foreground'] }}>Primary Button</Button>
            <Button variant="outline" style={{ borderColor: colors['--primary'], color: colors['--primary'] }}>Outline Button</Button>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
} 