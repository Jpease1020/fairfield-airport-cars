import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import fairfieldCustomRules from './scripts/eslint-rules/fairfield-custom-rules.js';


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
        HTMLButtonElement: 'readonly',
        Element: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        TouchEvent: 'readonly',
        PointerEvent: 'readonly',
        WheelEvent: 'readonly',
        Event: 'readonly',
        StorageEvent: 'readonly',
        getComputedStyle: 'readonly',
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
      'fairfield': fairfieldCustomRules,
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

      // Import consistency rules
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../ui-components/*', './ui-components/*'],
              message: '❌ Relative imports within design system are FORBIDDEN. Use @/ui instead.'
            },
            {
              group: ['../components/ui-components/*', './components/ui-components/*'],
              message: '❌ Relative imports within design system are FORBIDDEN. Use @/ui instead.'
            },
            {
              group: ['../design/components/ui-components/*', './design/components/ui-components/*'],
              message: '❌ Relative imports within design system are FORBIDDEN. Use @/ui instead.'
            }
          ]
        }
      ],

      // Custom Fairfield rules (consolidated from multiple files)
      'fairfield/no-hardcoded-colors': 'error',
      'fairfield/no-inline-styles': 'error', // 🚨 CRITICAL: No inline styles anywhere
      'fairfield/no-classname-props': 'error',
      'fairfield/no-html-structure': 'error',
      'fairfield/enforce-design-system': 'error',
      'fairfield/no-circular-ui-imports': 'error',
      'fairfield/enforce-types-architecture': 'error',
      'fairfield/no-absolute-imports-in-design': 'error',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // no-undef does not understand TypeScript types like HTMLAnchorElement
      // and can incorrectly flag them. Disable for TS files.
      'no-undef': 'off',
    },
  },
  // Re-enable no-undef on website pages to catch undefined variables there
  {
    files: ['src/app/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        HTMLScriptElement: 'readonly',
        HTMLAnchorElement: 'readonly',
        HTMLLabelElement: 'readonly',
        HTMLButtonElement: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
    },
  },
  // Test files: define common testing globals to avoid false no-undef
  {
    files: ['tests/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        // Vitest
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        // Playwright
        page: 'readonly',
        browser: 'readonly',
        context: 'readonly',
      },
    },
  },
  // 🛡️ DESIGN SYSTEM PROTECTION - Stricter rules for design directory
  {
    files: ['src/design/**/*.{js,jsx,ts,tsx}'],
    ignores: [
      'src/design/system/tokens/**/*', // Exclude design token files from hardcoded color detection
      'src/design/system/tokens/*.ts'  // Exclude token files
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'fairfield': fairfieldCustomRules,
    },
    rules: {
      // 🚨 CRITICAL: Design system protection rules
      'fairfield/no-hardcoded-colors': 'error',
      'fairfield/no-inline-styles': 'error',
      'fairfield/no-classname-props': 'error',
      'fairfield/no-html-structure': 'error',
      'fairfield/enforce-design-system': 'error',
      'fairfield/no-circular-ui-imports': 'error',
      'fairfield/enforce-types-architecture': 'error',
      'fairfield/no-absolute-imports-in-design': 'error',
      
      // 🔒 ADDITIONAL PROTECTION RULES FOR DESIGN DIRECTORY
      '@typescript-eslint/no-explicit-any': 'warn', // No any types in design system
      '@typescript-eslint/no-unused-vars': 'warn', // No unused variables
      'no-console': 'error', // No console logs in design system
      'no-debugger': 'error', // No debugger statements
      
      // 📦 IMPORT RESTRICTIONS FOR DESIGN SYSTEM
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../ui-components/*', './ui-components/*'],
              message: '❌ Relative imports within design system are FORBIDDEN. Use @/ui instead.'
            },
            {
              group: ['../components/ui-components/*', './components/ui-components/*'],
              message: '❌ Relative imports within design system are FORBIDDEN. Use @/ui instead.'
            },
            {
              group: ['../design/components/ui-components/*', './design/components/ui-components/*'],
              message: '❌ Relative imports within design system are FORBIDDEN. Use @/ui instead.'
            }
          ]
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
      'vitest.config.ts',
      'scripts/**/*',
      'temp-design-library/**/*'
    ]
  }
];
