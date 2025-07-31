import { CMSConfiguration } from '@/types/cms';

export function generateCSSVariables(cmsConfig: CMSConfiguration): React.CSSProperties {
  const themeColors = cmsConfig?.themeColors || {};
  
  const cssVars: Record<string, string> = {};
  
  // Convert theme colors to CSS custom properties
  Object.entries(themeColors).forEach(([key, value]) => {
    cssVars[`--${key}`] = value;
  });
  
  return cssVars as React.CSSProperties;
} 