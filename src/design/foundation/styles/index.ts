// Foundation Styles - Runtime implementation of design tokens
// These CSS files provide the runtime implementation of design tokens

// CSS files are imported directly in the app
// This index provides TypeScript exports for style utilities

export const stylePaths = {
  variables: './variables.css',
  critical: './critical.css',
  globals: './globals.css',
  standardLayout: './standard-layout.css',
  pageEditable: './page-editable.css',
} as const;

// Style utility functions
export const getStylePath = (style: keyof typeof stylePaths) => {
  return stylePaths[style];
};

// Export style constants for reference
export const STYLE_CONSTANTS = {
  CSS_VARIABLES_FILE: 'variables.css',
  CRITICAL_CSS_FILE: 'critical.css',
  GLOBAL_STYLES_FILE: 'globals.css',
  LAYOUT_STYLES_FILE: 'standard-layout.css',
  EDITABLE_STYLES_FILE: 'page-editable.css',
} as const; 