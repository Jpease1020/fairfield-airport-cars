'use client';

import React, { useEffect, useState } from 'react';

interface AccessibilityEnhancerProps {
  children: React.ReactNode;
}

interface AccessibilitySettings {
  highContrast: boolean;
  reduceMotion: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  focusIndicators: boolean;
}

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
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    reduceMotion: false,
    fontSize: 'normal',
    focusIndicators: true,
  });
  const [showPanel, setShowPanel] = useState(false);

  // Load accessibility preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accessibility-settings');
      if (saved) {
        try {
          setSettings(JSON.parse(saved));
        } catch (error) {
          console.warn('Failed to load accessibility settings:', error);
        }
      }

      // Respect system preferences
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

      setSettings(prev => ({
        ...prev,
        reduceMotion: prev.reduceMotion || prefersReducedMotion,
        highContrast: prev.highContrast || prefersHighContrast,
      }));
    }
  }, []);

  // Save settings to localStorage and apply to document
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility-settings', JSON.stringify(settings));

      // Apply accessibility classes to document
      const root = document.documentElement;
      
      // High contrast
      root.classList.toggle('accessibility-high-contrast', settings.highContrast);
      
      // Reduced motion
      root.classList.toggle('accessibility-reduce-motion', settings.reduceMotion);
      
      // Font size
      root.classList.remove('accessibility-font-large', 'accessibility-font-extra-large');
      if (settings.fontSize === 'large') {
        root.classList.add('accessibility-font-large');
      } else if (settings.fontSize === 'extra-large') {
        root.classList.add('accessibility-font-extra-large');
      }
      
      // Enhanced focus indicators
      root.classList.toggle('accessibility-enhanced-focus', settings.focusIndicators);
    }
  }, [settings]);

  // Keyboard navigation for accessibility panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + A to toggle accessibility panel
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        setShowPanel(prev => !prev);
        announceToScreenReader('Accessibility panel toggled');
      }
      
      // Escape to close panel
      if (event.key === 'Escape' && showPanel) {
        setShowPanel(false);
        announceToScreenReader('Accessibility panel closed');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPanel]);

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
    announceToScreenReader(`${key} setting changed to ${value}`);
  };

  return (
    <div className="accessibility-enhancer">
      {children}
      
      {/* Accessibility Panel Toggle */}
      <button
        className="accessibility-toggle"
        onClick={() => setShowPanel(!showPanel)}
        aria-label="Toggle accessibility options (Alt + A)"
        title="Accessibility Options (Alt + A)"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'var(--background-primary)',
          border: '2px solid var(--border-color)',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        ♿
      </button>

      {/* Accessibility Settings Panel */}
      {showPanel && (
        <div
          className="accessibility-panel"
          role="dialog"
          aria-labelledby="accessibility-panel-title"
          aria-modal="true"
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 9998,
            background: 'var(--background-primary)',
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--border-radius)',
            padding: 'var(--spacing-lg)',
            width: '300px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <h2 id="accessibility-panel-title" style={{ margin: '0 0 var(--spacing-md) 0' }}>
            Accessibility Options
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {/* High Contrast */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => updateSetting('highContrast', e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span>High Contrast Mode</span>
            </label>

            {/* Reduce Motion */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <input
                type="checkbox"
                checked={settings.reduceMotion}
                onChange={(e) => updateSetting('reduceMotion', e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Reduce Motion</span>
            </label>

            {/* Enhanced Focus */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <input
                type="checkbox"
                checked={settings.focusIndicators}
                onChange={(e) => updateSetting('focusIndicators', e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Enhanced Focus Indicators</span>
            </label>

            {/* Font Size */}
            <div>
              <label htmlFor="font-size-select" style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                Font Size
              </label>
              <select
                id="font-size-select"
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', e.target.value as AccessibilitySettings['fontSize'])}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  background: 'var(--background-primary)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="normal">Normal</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </select>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowPanel(false)}
              style={{
                marginTop: 'var(--spacing-md)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                background: 'var(--background-secondary)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              Close (Esc)
            </button>
          </div>
        </div>
      )}

      {/* Accessibility CSS Styles */}
      <style jsx global>{`
        /* High Contrast Mode */
        .accessibility-high-contrast {
          --text-primary: #000000;
          --text-secondary: #333333;
          --background-primary: #ffffff;
          --background-secondary: #f5f5f5;
          --border-color: #000000;
          --primary-color: #0000ff;
          --success-color: #008000;
          --error-color: #ff0000;
          --warning-color: #ff8c00;
        }

        /* Reduced Motion */
        .accessibility-reduce-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }

        /* Font Size Adjustments */
        .accessibility-font-large {
          font-size: 18px;
        }
        
        .accessibility-font-extra-large {
          font-size: 22px;
        }

        /* Enhanced Focus Indicators */
        .accessibility-enhanced-focus *:focus {
          outline: 3px solid var(--primary-color) !important;
          outline-offset: 2px !important;
        }

        .accessibility-enhanced-focus button:focus,
        .accessibility-enhanced-focus input:focus,
        .accessibility-enhanced-focus select:focus,
        .accessibility-enhanced-focus textarea:focus,
        .accessibility-enhanced-focus a:focus {
          box-shadow: 0 0 0 3px var(--primary-color) !important;
        }

        /* Skip Links */
        .skip-link {
          position: absolute;
          top: -40px;
          left: 6px;
          background: var(--background-primary);
          color: var(--text-primary);
          padding: 8px;
          text-decoration: none;
          border-radius: 4px;
          z-index: 10000;
          border: 2px solid var(--border-color);
        }

        .skip-link:focus {
          top: 6px;
        }

        /* Touch Target Sizes */
        @media (pointer: coarse) {
          button,
          input[type="button"],
          input[type="submit"],
          input[type="reset"],
          .btn,
          .accessibility-toggle {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>

      {/* Skip Navigation Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
    </div>
  );
};

export default AccessibilityEnhancer; 