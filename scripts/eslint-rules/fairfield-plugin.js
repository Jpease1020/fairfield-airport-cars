/**
 * 🎯 Fairfield Architecture Guardrails ESLint Plugin
 * 
 * Custom ESLint plugin to enforce our design system and architecture rules
 */

const architectureGuardrails = require('./architecture-guardrails.js');

module.exports = {
  rules: {
    'no-hardcoded-colors': architectureGuardrails.rules['no-hardcoded-colors'],
    'no-inline-styles': architectureGuardrails.rules['no-inline-styles'],
    'no-classname-props': architectureGuardrails.rules['no-classname-props'],
    'enforce-styled-components': architectureGuardrails.rules['enforce-styled-components'],
    'no-raw-html': architectureGuardrails.rules['no-raw-html'],
    'use-design-tokens': architectureGuardrails.rules['use-design-tokens'],
    'css-file-size-limit': architectureGuardrails.rules['css-file-size-limit']
  }
}; 