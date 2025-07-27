'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card, CardBody, CardHeader, CardTitle } from './card';
import { Input, Label, Select, Option } from './index';
import { Container, Span } from '@/components/ui';

interface AccessibilityEnhancerProps {
  children: React.ReactNode;
}

interface AccessibilitySettings {
  highContrast: boolean;
  reduceMotion: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  focusIndicators: boolean;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  reduceMotion: false,
  fontSize: 'normal',
  focusIndicators: false,
};

/**
 * AccessibilityEnhancer - Provides comprehensive accessibility features
 * 
 * Features:
 * - High contrast mode toggle
 * - Reduced motion preferences
 * - Font size adjustment
 * - Enhanced focus indicators
 * - Keyboard navigation support
 * - Screen reader announcements
 * 
 * WCAG 2.1 AA Compliance:
 * - 1.4.3 Contrast (Minimum)
 * - 1.4.6 Contrast (Enhanced) 
 * - 2.3.3 Animation from Interactions
 * - 2.4.7 Focus Visible
 * - 4.1.3 Status Messages
 */
export const AccessibilityEnhancer: React.FC<AccessibilityEnhancerProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [showPanel, setShowPanel] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error);
      }
    }
  }, []);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply reduce motion
    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Apply font size
    root.classList.remove('font-size-normal', 'font-size-large', 'font-size-extra-large');
    root.classList.add(`font-size-${settings.fontSize}`);

    // Apply focus indicators
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }

    // Save settings to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + A to toggle accessibility panel
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        setShowPanel(!showPanel);
      }

      // Escape to close panel
      if (event.key === 'Escape' && showPanel) {
        setShowPanel(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPanel]);

  // Screen reader announcement
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Announce changes to screen readers
    const settingNames = {
      highContrast: 'High contrast mode',
      reduceMotion: 'Reduce motion',
      fontSize: 'Font size',
      focusIndicators: 'Enhanced focus indicators'
    };
    
    const action = value ? 'enabled' : 'disabled';
    announceToScreenReader(`${settingNames[key]} ${action}`);
  };

  return (
    <>
      {children}
      
      {/* Accessibility Panel Toggle */}
      <Button
        onClick={() => setShowPanel(!showPanel)}
        variant="outline"
        size="sm"
        className="accessibility-toggle-button"
        aria-label="Toggle accessibility options (Alt + A)"
      >
        ♿
      </Button>

      {/* Accessibility Settings Panel */}
      {showPanel && (
        <Card className="accessibility-panel">
          <CardHeader>
            <CardTitle>Accessibility Options</CardTitle>
          </CardHeader>
          <CardBody>
            <Container className="accessibility-settings">
              {/* High Contrast */}
              <label >
                <Input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => updateSetting('highContrast', e.target.checked)}
                />
                <Span>High Contrast Mode</Span>
              </label>

              {/* Reduce Motion */}
              <label >
                <Input
                  type="checkbox"
                  checked={settings.reduceMotion}
                  onChange={(e) => updateSetting('reduceMotion', e.target.checked)}
                />
                <Span>Reduce Motion</Span>
              </label>

              {/* Enhanced Focus */}
              <label >
                <Input
                  type="checkbox"
                  checked={settings.focusIndicators}
                  onChange={(e) => updateSetting('focusIndicators', e.target.checked)}
                />
                <Span>Enhanced Focus Indicators</Span>
              </label>

              {/* Font Size */}
              <Container className="accessibility-setting-group">
                <Label htmlFor="font-size-select" >
                  Font Size
                </Label>
                <Select
                  id="font-size-select"
                  value={settings.fontSize}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateSetting('fontSize', e.target.value as AccessibilitySettings['fontSize'])}
                  className="accessibility-setting-select"
                >
                  <Option value="normal">Normal</Option>
                  <Option value="large">Large</Option>
                  <Option value="extra-large">Extra Large</Option>
                </Select>
              </Container>
            </Container>
          </CardBody>
        </Card>
      )}

      {/* Skip to main content link */}
      <a href="#main-content" >
        Skip to main content
      </a>
    </>
  );
};

export default AccessibilityEnhancer; 