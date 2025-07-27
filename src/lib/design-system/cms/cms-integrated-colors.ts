import { CMSConfiguration } from '@/types/cms';

export const getCMSColors = (cmsConfig: CMSConfiguration) => {
  const themeColors = cmsConfig.themeColors || {};
  
  return {
    // Brand colors from CMS theme colors or defaults
    brand: {
      primary: themeColors['brand-primary'] || cmsConfig.business?.branding?.primaryColor || '#0B1F3A',
      primaryHover: themeColors['brand-primary-hover'] || '#08142A', // Default hover color
      secondary: themeColors['brand-secondary'] || cmsConfig.business?.branding?.secondaryColor || '#3B82F6',
      secondaryHover: themeColors['brand-secondary-hover'] || '#2563EB', // Default hover color
    },
    // Semantic colors from CMS theme colors or defaults
    success: { 
      base: themeColors['success-base'] || '#10B981', 
      hover: themeColors['success-hover'] || '#059669',
      light: themeColors['success-light'] || '#D1FAE5',
      dark: themeColors['success-dark'] || '#065F46'
    },
    warning: { 
      base: themeColors['warning-base'] || '#F59E0B', 
      hover: themeColors['warning-hover'] || '#D97706',
      light: themeColors['warning-light'] || '#FEF3C7',
      dark: themeColors['warning-dark'] || '#92400E'
    },
    error: { 
      base: themeColors['error-base'] || '#EF4444', 
      hover: themeColors['error-hover'] || '#DC2626',
      light: themeColors['error-light'] || '#FEE2E2',
      dark: themeColors['error-dark'] || '#991B1B'
    },
    info: { 
      base: themeColors['info-base'] || '#3B82F6', 
      hover: themeColors['info-hover'] || '#2563EB',
      light: themeColors['info-light'] || '#DBEAFE',
      dark: themeColors['info-dark'] || '#1E40AF'
    },
    // Text colors from CMS theme colors or defaults
    text: {
      primary: themeColors['text-primary'] || '#374151',
      secondary: themeColors['text-secondary'] || '#6B7280',
      muted: themeColors['text-muted'] || '#9CA3AF',
      inverse: themeColors['text-inverse'] || '#FFFFFF',
      success: themeColors['text-success'] || '#065F46',
      warning: themeColors['text-warning'] || '#92400E',
      error: themeColors['text-error'] || '#991B1B',
      info: themeColors['text-info'] || '#1E40AF',
    },
    // Background colors from CMS theme colors or defaults
    background: {
      primary: themeColors['bg-primary'] || '#FFFFFF',
      secondary: themeColors['bg-secondary'] || '#F9FAFB',
      muted: themeColors['bg-muted'] || '#F3F4F6',
      inverse: themeColors['bg-inverse'] || '#1F2937',
      success: themeColors['bg-success'] || '#D1FAE5',
      warning: themeColors['bg-warning'] || '#FEF3C7',
      error: themeColors['bg-error'] || '#FEE2E2',
      info: themeColors['bg-info'] || '#DBEAFE',
    },
    // Border colors from CMS theme colors or defaults
    border: {
      primary: themeColors['border-primary'] || '#E5E7EB',
      secondary: themeColors['border-secondary'] || '#F3F4F6',
      success: themeColors['border-success'] || '#10B981',
      warning: themeColors['border-warning'] || '#F59E0B',
      error: themeColors['border-error'] || '#EF4444',
      info: themeColors['border-info'] || '#3B82F6',
    },
  };
};

// Default colors for when CMS is not available
export const defaultColors = {
  brand: {
    primary: '#0B1F3A',
    primaryHover: '#08142A',
    secondary: '#3B82F6',
    secondaryHover: '#2563EB',
  },
  success: { base: '#10B981', hover: '#059669', light: '#D1FAE5', dark: '#065F46' },
  warning: { base: '#F59E0B', hover: '#D97706', light: '#FEF3C7', dark: '#92400E' },
  error: { base: '#EF4444', hover: '#DC2626', light: '#FEE2E2', dark: '#991B1B' },
  info: { base: '#3B82F6', hover: '#2563EB', light: '#DBEAFE', dark: '#1E40AF' },
  text: {
    primary: '#374151',
    secondary: '#6B7280',
    muted: '#9CA3AF',
    inverse: '#FFFFFF',
    success: '#065F46',
    warning: '#92400E',
    error: '#991B1B',
    info: '#1E40AF',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    muted: '#F3F4F6',
    inverse: '#1F2937',
    success: '#D1FAE5',
    warning: '#FEF3C7',
    error: '#FEE2E2',
    info: '#DBEAFE',
  },
  border: {
    primary: '#E5E7EB',
    secondary: '#F3F4F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
}; 