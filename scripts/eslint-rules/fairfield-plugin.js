/**
 * 🎯 Fairfield Architecture Guardrails ESLint Plugin
 * 
 * Custom ESLint plugin to enforce our design system and architecture rules
 */

import architectureGuardrails from './architecture-guardrails.js';

export default {
  rules: {
    'no-classname': architectureGuardrails.rules['no-classname-props'],
    'no-inline-styles-on-divs': architectureGuardrails.rules['no-inline-styles'],
    'no-styled-components-in-files': architectureGuardrails.rules['enforce-styled-components'],
    'enforce-layout-components': architectureGuardrails.rules['no-raw-html'],
    'no-react-css-properties': architectureGuardrails.rules['no-hardcoded-colors'],
    'design-system-first': architectureGuardrails.rules['use-design-tokens'],
    'no-multiple-styled-components': architectureGuardrails.rules['css-file-size-limit'],
    'check-existing-components': architectureGuardrails.rules['no-raw-html'],
    'no-underscore-props': architectureGuardrails.rules['no-classname-props']
  }
}; 