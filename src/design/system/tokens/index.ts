import React from 'react';

// Define CMSConfiguration interface locally for this component
interface CMSConfiguration {
  themeColors?: Record<string, string>;
  business?: {
    branding?: {
      primaryColor?: string;
      secondaryColor?: string;
    };
  };
}

export { colors, spacing } from './tokens';

export function generateCSSVariables(cmsConfig: CMSConfiguration): React.CSSProperties {
  const themeColors = cmsConfig?.themeColors || {};
  
  const cssVars: Record<string, string> = {};
  
  // Convert theme colors to CSS custom properties
  Object.entries(themeColors).forEach(([key, value]) => {
    cssVars[`--${key}`] = value;
  });
  
  return cssVars as React.CSSProperties;
} 