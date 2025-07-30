import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import fairfieldPlugin from './scripts/eslint-rules/fairfield-plugin.js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        history: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        performance: 'readonly',
        crypto: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        WebSocket: 'readonly',
        Notification: 'readonly',
        SpeechSynthesisUtterance: 'readonly',
        PerformanceObserver: 'readonly',
        PerformanceNavigationTiming: 'readonly',
        Request: 'readonly',
        RequestInfo: 'readonly',
        RequestInit: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        HTMLElement: 'readonly',
        HTMLFormElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLSelectElement: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLLinkElement: 'readonly',
        HTMLDivElement: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        TouchEvent: 'readonly',
        PointerEvent: 'readonly',
        WheelEvent: 'readonly',
        Event: 'readonly',
        StorageEvent: 'readonly',
        NodeJS: 'readonly',
        global: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        Buffer: 'readonly',
        
        // Node.js globals
        process: 'readonly',
        
        // Google Maps API globals
        google: 'readonly',
        
        // React globals
        React: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      '@next/next': nextPlugin,
      fairfield: fairfieldPlugin,
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'caughtErrorsIgnorePattern': '^_',
        'ignoreRestSiblings': true
      }],
      'no-unused-vars': ['warn', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'caughtErrorsIgnorePattern': '^_',
        'ignoreRestSiblings': true
      }],

      
      // Fairfield Custom Rules
      'fairfield/no-classname': 'error',
      'fairfield/no-inline-styles-on-divs': 'error',
      'fairfield/no-styled-components-in-files': 'error',
      'fairfield/enforce-layout-components': 'warn',
      'fairfield/no-react-css-properties': 'error',
      'fairfield/design-system-first': 'warn',
      'fairfield/no-multiple-styled-components': 'error',
      'fairfield/check-existing-components': 'error',
      'fairfield/no-underscore-props': 'error',
      
      // Architecture guardrails
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#[0-9a-fA-F]{3,6}$/]',
          message: '❌ Hardcoded color detected. Use design tokens instead: colors.primary[600]'
        },
        {
          selector: 'JSXAttribute[name.name="style"]',
          message: '❌ Inline styles are forbidden. Use styled-components instead.'
        }
      ],
      
      // Prevent className usage
      'no-restricted-globals': [
        'error',
        {
          name: 'className',
          message: '❌ className is FORBIDDEN. Use styled-components and design tokens instead.'
        }
      ],
      
      // Prevent style props on design system components
      'no-restricted-properties': [
        'error',
        {
          object: 'Card',
          property: 'style',
          message: '❌ style prop is FORBIDDEN on design system components. Use design system props instead.'
        },
        {
          object: 'Stack',
          property: 'style',
          message: '❌ style prop is FORBIDDEN on design system components. Use design system props instead.'
        },
        {
          object: 'Box',
          property: 'style',
          message: '❌ style prop is FORBIDDEN on design system components. Use design system props instead.'
        },
        {
          object: 'Container',
          property: 'style',
          message: '❌ style prop is FORBIDDEN on design system components. Use design system props instead.'
        },
        {
          object: 'Text',
          property: 'style',
          message: '❌ style prop is FORBIDDEN on design system components. Use design system props instead.'
        }
      ],
    },
  },
  {
    ignores: [
      'src/future-features/**/*',
      'node_modules/**/*',
      '.next/**/*',
      'coverage/**/*',
      'test-results/**/*',
      'playwright-report/**/*',
      'tests/**/*',
      'vitest.config.ts'
    ]
  }
];
