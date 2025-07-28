'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors, spacing, fontSize, borderRadius, shadows, transitions, zIndex } from '@/lib/design-system/tokens';
import { Button } from './button';
import { Card, CardBody, CardHeader, CardTitle } from './card';
import { Input, Label, Select, Option } from './index';
import { Container, Span, Link } from '@/components/ui';

// Styled accessibility toggle button
const AccessibilityToggleButton = styled(Button)`
  position: fixed;
  bottom: ${spacing.lg};
  right: ${spacing.lg};
  z-index: ${zIndex.modal};
  border-radius: ${borderRadius.pill};
  width: 3rem;
  height: 3rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${fontSize.lg};
  box-shadow: ${shadows.lg};
  transition: ${transitions.default};
  
  &:hover {
    transform: scale(1.05);
    box-shadow: ${shadows.xl};
  }
`;

// Styled accessibility panel
const AccessibilityPanel = styled(Card)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: ${zIndex.modal + 1};
  max-width: 400px;
  width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: ${shadows.xl};
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translate(-50%, -60%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }
`;

// Styled accessibility settings container
const AccessibilitySettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

// Styled accessibility setting group
const AccessibilitySettingGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm};
  border-radius: ${borderRadius.default};
  background-color: ${colors.background.secondary};
  transition: ${transitions.default};
  
  &:hover {
    background-color: ${colors.background.tertiary};
  }
`;

// Styled accessibility setting label
const AccessibilitySettingLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  cursor: pointer;
  font-weight: 500;
  color: ${colors.text.primary};
  flex: 1;
`;

// Styled accessibility setting select
const AccessibilitySettingSelect = styled(Select)`
  width: 100%;
  margin-top: ${spacing.xs};
`;

// Styled skip link
const SkipLink = styled(Link)`
  position: absolute;
  top: -40px;
  left: 6px;
  background-color: ${colors.primary[600]};
  color: ${colors.background.primary};
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.default};
  text-decoration: none;
  font-weight: 500;
  z-index: ${zIndex.modal + 2};
  transition: ${transitions.default};
  
  &:focus {
    top: 6px;
    outline: 2px solid ${colors.primary[400]};
    outline-offset: 2px;
  }
`;

// Styled overlay
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: ${zIndex.modal};
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowPanel(false);
    }
  };

  return (
    <>
      {children}
      
      {/* Accessibility Panel Toggle */}
      <AccessibilityToggleButton
        onClick={() => setShowPanel(!showPanel)}
        variant="outline"
        size="sm"
        aria-label="Toggle accessibility options (Alt + A)"
      >
        ♿
      </AccessibilityToggleButton>

      {/* Accessibility Settings Panel */}
      {showPanel && (
        <>
          <Overlay onClick={handleOverlayClick} />
          <AccessibilityPanel>
            <CardHeader>
              <CardTitle>Accessibility Options</CardTitle>
            </CardHeader>
            <CardBody>
              <AccessibilitySettingsContainer>
                {/* High Contrast */}
                <AccessibilitySettingGroup>
                  <AccessibilitySettingLabel>
                    <Input
                      type="checkbox"
                      checked={settings.highContrast}
                      onChange={(e) => updateSetting('highContrast', e.target.checked)}
                    />
                    <Span>High Contrast Mode</Span>
                  </AccessibilitySettingLabel>
                </AccessibilitySettingGroup>

                {/* Reduce Motion */}
                <AccessibilitySettingGroup>
                  <AccessibilitySettingLabel>
                    <Input
                      type="checkbox"
                      checked={settings.reduceMotion}
                      onChange={(e) => updateSetting('reduceMotion', e.target.checked)}
                    />
                    <Span>Reduce Motion</Span>
                  </AccessibilitySettingLabel>
                </AccessibilitySettingGroup>

                {/* Enhanced Focus */}
                <AccessibilitySettingGroup>
                  <AccessibilitySettingLabel>
                    <Input
                      type="checkbox"
                      checked={settings.focusIndicators}
                      onChange={(e) => updateSetting('focusIndicators', e.target.checked)}
                    />
                    <Span>Enhanced Focus Indicators</Span>
                  </AccessibilitySettingLabel>
                </AccessibilitySettingGroup>

                {/* Font Size */}
                <AccessibilitySettingGroup>
                  <Label htmlFor="font-size-select" size="md">
                    Font Size
                  </Label>
                  <AccessibilitySettingSelect
                    id="font-size-select"
                    value={settings.fontSize}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateSetting('fontSize', e.target.value as AccessibilitySettings['fontSize'])}
                    options={[
                      { value: 'normal', label: 'Normal' },
                      { value: 'large', label: 'Large' },
                      { value: 'extra-large', label: 'Extra Large' }
                    ]}
                  />
                </AccessibilitySettingGroup>
              </AccessibilitySettingsContainer>
            </CardBody>
          </AccessibilityPanel>
        </>
      )}

      {/* Skip to main content link */}
      <SkipLink href="#main-content">
        Skip to main content
      </SkipLink>
    </>
  );
};

export default AccessibilityEnhancer; 