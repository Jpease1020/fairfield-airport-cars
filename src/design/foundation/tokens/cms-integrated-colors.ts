// CMS-integrated colors - Moved to business layer to avoid circular dependencies
// This function should be in a business utility file, not in the design system

export const getCMSColors = (cmsConfig: any) => {
  const themeColors = cmsConfig.themeColors || {};
  
  return {
    // Brand colors from CMS theme colors or defaults
    brand: {
      primary: themeColors['brand-primary'] || cmsConfig.business?.branding?.primaryColor,
      primaryHover: themeColors['brand-primary-hover'],
      secondary: themeColors['brand-secondary'] || cmsConfig.business?.branding?.secondaryColor,
      secondaryHover: themeColors['brand-secondary-hover'],
    },
    // Semantic colors from CMS theme colors or defaults
    //Hardcoded colors are FORBIDDEN in design system. Use CSS variables or design tokens

    success: { 
      base: themeColors['success-base'],
      hover: themeColors['success-hover'],
      light: themeColors['success-light'],
      dark: themeColors['success-dark'],
    },
    warning: { 
      base: themeColors['warning-base'],
      hover: themeColors['warning-hover'],
      light: themeColors['warning-light'],
      dark: themeColors['warning-dark'],
    },
    error: { 
      base: themeColors['error-base'],
      hover: themeColors['error-hover'],
      light: themeColors['error-light'],
      dark: themeColors['error-dark'],
    },
    info: { 
      base: themeColors['info-base'],
      hover: themeColors['info-hover'],
      light: themeColors['info-light'],
      dark: themeColors['info-dark'],
    },
    // Text colors from CMS theme colors or defaults
    text: {
      primary: themeColors['text-primary'],
      secondary: themeColors['text-secondary'],
      muted: themeColors['text-muted'],
      inverse: themeColors['text-inverse'],
      success: themeColors['text-success'],
      warning: themeColors['text-warning'],
      error: themeColors['text-error'],
      info: themeColors['text-info'],
    },
    // Background colors from CMS theme colors or defaults
    background: {
      primary: themeColors['bg-primary'],
      secondary: themeColors['bg-secondary'],
      muted: themeColors['bg-muted'],
      inverse: themeColors['bg-inverse'],
      success: themeColors['bg-success'],
      warning: themeColors['bg-warning'],
      error: themeColors['bg-error'],
      info: themeColors['bg-info'],
    },
    // Border colors from CMS theme colors or defaults
    border: {
      primary: themeColors['border-primary'],
      secondary: themeColors['border-secondary'],
      success: themeColors['border-success'],
      warning: themeColors['border-warning'],
      error: themeColors['border-error'],
      info: themeColors['border-info'],
    },
  };
};

// Default colors for when CMS is not available
export const defaultColors = {
  brand: {
    primary: 'var(--color-brand-primary)',
    primaryHover: 'var(--color-brand-primary-hover)',
    secondary: 'var(--color-brand-secondary)',
    secondaryHover: 'var(--color-brand-secondary-hover)',
  },
  success: { 
    base: 'var(--color-success-base)', 
    hover: 'var(--color-success-hover)', 
    light: 'var(--color-success-light)', 
    dark: 'var(--color-success-dark)' 
  },
  warning: { 
    base: 'var(--color-warning-base)', 
    hover: 'var(--color-warning-hover)', 
    light: 'var(--color-warning-light)', 
    dark: 'var(--color-warning-dark)' 
  },
  error: { 
    base: 'var(--color-error-base)', 
    hover: 'var(--color-error-hover)', 
    light: 'var(--color-error-light)', 
    dark: 'var(--color-error-dark)' 
  },
  info: { 
    base: 'var(--color-info-base)', 
    hover: 'var(--color-info-hover)', 
    light: 'var(--color-info-light)', 
    dark: 'var(--color-info-dark)' 
  },
  text: {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    muted: 'var(--color-text-muted)',
    inverse: 'var(--color-text-inverse)',
    success: 'var(--color-text-success)',
    warning: 'var(--color-text-warning)',
    error: 'var(--color-text-error)',
    info: 'var(--color-text-info)',
  },
  background: {
    primary: 'var(--color-bg-primary)',
    secondary: 'var(--color-bg-secondary)',
    muted: 'var(--color-bg-muted)',
    inverse: 'var(--color-bg-inverse)',
    success: 'var(--color-bg-success)',
    warning: 'var(--color-bg-warning)',
    error: 'var(--color-bg-error)',
    info: 'var(--color-bg-info)',
  },
  border: {
    primary: 'var(--color-border-primary)',
    secondary: 'var(--color-border-secondary)',
    success: 'var(--color-border-success)',
    warning: 'var(--color-border-warning)',
    error: 'var(--color-border-error)',
    info: 'var(--color-border-info)',
  },
}; 