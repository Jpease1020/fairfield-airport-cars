'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Input, Select, Span, Link, Box, Stack } from '@/ui';
import { Overlay } from '@/design/components/ui-components/Overlay';

const AccessibilityToggleButton = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  width: auto;
  display: inline-block;
`;

const SkipLink = styled.a`
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
  font-size: 14px;
  
  &:focus {
    top: 6px;
  }
  
  &:not(:focus) {
    top: -40px;
  }
`;

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

export interface AccessibilityEnhancerProps {
  children: React.ReactNode;
}

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
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    announceToScreenReader(`${key} ${value ? 'enabled' : 'disabled'}`);
  };

  return (
    <>
      {children}

      {/* Accessibility Toggle Button */}
      <AccessibilityToggleButton>
        <Box
          variant="elevated"
          padding="sm"
          rounded="full"
          margin="none"
        >
          <Button
            onClick={() => setShowPanel(!showPanel)}
            variant="outline"
            size="sm"
            aria-label="Toggle accessibility options (Alt + A)"
          >
            ♿
          </Button>
        </Box>
      </AccessibilityToggleButton>

      {/* Accessibility Settings Panel */}
      <Overlay
        isOpen={showPanel}
        onClose={() => setShowPanel(false)}
        variant="modal"
        position="center"
        closeOnBackdropClick={true}
        closeOnEscape={true}
      >
        <Box>
            <Stack direction="vertical" spacing="md">
              {/* High Contrast */}
              <Stack direction="horizontal" align="center" spacing="sm">
                <Input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => updateSetting('highContrast', e.target.checked)}
                />
                <Span>High Contrast Mode</Span>
              </Stack>

              {/* Reduce Motion */}
              <Stack direction="horizontal" align="center" spacing="sm">
                <Input
                  type="checkbox"
                  checked={settings.reduceMotion}
                  onChange={(e) => updateSetting('reduceMotion', e.target.checked)}
                />
                <Span>Reduce Motion</Span>
              </Stack>

              {/* Enhanced Focus */}
              <Stack direction="horizontal" align="center" spacing="sm">
                <Input
                  type="checkbox"
                  checked={settings.focusIndicators}
                  onChange={(e) => updateSetting('focusIndicators', e.target.checked)}
                />
                <Span>Enhanced Focus Indicators</Span>
              </Stack>

              {/* Font Size */}
              <Stack direction="vertical" spacing="sm">
                <Span>Font Size</Span>
                <Select
                  value={settings.fontSize}
                  onChange={(e) => updateSetting('fontSize', e.target.value as AccessibilitySettings['fontSize'])}
                  options={[
                    { value: 'normal', label: 'Normal' },
                    { value: 'large', label: 'Large' },
                    { value: 'extra-large', label: 'Extra Large' }
                  ]}
                />
              </Stack>
            </Stack>
        </Box>
      </Overlay>

      {/* Skip to main content link */}
      <SkipLink href="#main-content">
        Skip to main content
      </SkipLink>
    </>
  );
};

export default AccessibilityEnhancer; 